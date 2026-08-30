using Api.Core.Exceptions;
using Api.Core.Repositories;
using Api.Core.Responses;
using Api.Core.Security;
using Api.Features.Roles;
using Api.Features.UserRoles;
using Api.Features.Users;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Api.Features.Authentication;

public class AuthenticationService(
  IUserRepository _userRepository,
  IRoleRepository _roleRepository,
  UserBusinessRules _userBusinessRules,
  AuthenticationBusinessRules _authBusinessRules,
  IRefreshTokenService _refreshTokenService,
  IPasswordService<User> _passwordService,
  UserMapper _mapper,
  IUnitOfWork _unitOfWork,
  IValidator<RegisterUserRequest> _registerValidator,
  IValidator<LoginRequest> _loginValidator,
  IOptions<TokenOptions> _tokenOptions,
  ILogger<AuthenticationService> _logger) : IAuthenticationService
{
  private readonly TokenOptions _options = _tokenOptions.Value;

  public async Task<ReturnModel<AuthenticationResult>> LoginAsync(
    LoginRequest request,
    string? ipAddress,
    CancellationToken cancellationToken)
  {
    _logger.LogInformation("Giriş denemesi başlatıldı. E-posta: {Email}", request.Email);

    var validationResult = await _loginValidator.ValidateAsync(request, cancellationToken);

    if (!validationResult.IsValid)
    {
      _logger.LogWarning("Giriş doğrulaması başarısız oldu: {Email}", request.Email);

      throw new ValidationException(validationResult.Errors);
    }

    User? user = await _userRepository.GetAsync(
      predicate: u => u.Email == request.Email,
      include: query => query.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
      enableTracking: true,
      cancellationToken: cancellationToken);

    var outcome = user != null
      ? _userBusinessRules.VerifyPassword(user, request.Password)
      : PasswordVerificationOutcome.Failed;

    _authBusinessRules.UserCredentialsMustMatch(user, outcome);
    _userBusinessRules.UserAccountMustBeActive(user!);

    // Application service decides whether the verified password needs to be persisted in the
    // current scheme — the password service itself never mutates or persists anything.
    if (outcome is PasswordVerificationOutcome.LegacyUpgradeNeeded or PasswordVerificationOutcome.SuccessRehashNeeded)
    {
      user!.PasswordHash = _passwordService.HashPassword(user, request.Password);

      if (outcome == PasswordVerificationOutcome.LegacyUpgradeNeeded)
      {
        user.PasswordKey = null;
      }

      _userRepository.Update(user);
    }

    var (token, rawRefreshToken) = await _refreshTokenService.IssueAsync(user!.Id, ipAddress, cancellationToken);

    await _unitOfWork.SaveChangesAsync(cancellationToken);

    _logger.LogInformation("Kullanıcı başarıyla giriş yaptı. ID: {UserId}", user.Id);

    var response = CreateToken(user, rawRefreshToken, token.ExpiresAt);

    return new ReturnModel<AuthenticationResult>()
    {
      Data = response,
      Success = true,
      StatusCode = 200,
      Message = "Giriş başarılı."
    };
  }

  public async Task<ReturnModel<CreatedUserResponseDto>> RegisterAsync(
     RegisterUserRequest request,
     CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Yeni kullanıcı kaydı süreci başlatıldı: {Username}", request.Username);

    var validationResult = await _registerValidator.ValidateAsync(request, cancellationToken);

    if (!validationResult.IsValid)
    {
      _logger.LogWarning("Kayıt validasyon hatası: {Username} ({Email})", request.Username, request.Email);

      throw new ValidationException(validationResult.Errors);
    }

    await _userBusinessRules.EmailMustBeUniqueAsync(request.Email, id: null, cancellationToken);
    await _userBusinessRules.UsernameMustBeUniqueAsync(request.Username, id: null, cancellationToken);

    User createdUser = _mapper.RegisterToEntity(request);

    var defaultRole = await _roleRepository.GetAsync(
      r => r.Name == "Viewer",
      cancellationToken: cancellationToken);

    if (defaultRole != null)
    {
      createdUser.UserRoles.Add(new UserRole
      {
        User = createdUser,
        RoleId = defaultRole.Id
      });
    }
    else
    {
      _logger.LogError("Sistem hatası: 'Viewer' rolü veritabanında bulunamadı!");

      throw new BusinessException("Sistem yapılandırma hatası: Varsayılan rol bulunamadı.");
    }

    createdUser.PasswordHash = _passwordService.HashPassword(createdUser, request.Password);

    await _userRepository.AddAsync(createdUser, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    _logger.LogInformation("Kullanıcı ve rolü başarıyla kaydedildi. ID: {UserId}", createdUser.Id);

    CreatedUserResponseDto response = _mapper.EntityToCreatedResponseDto(createdUser);

    return new ReturnModel<CreatedUserResponseDto>
    {
      Success = true,
      Message = "Kaydınız başarıyla tamamlandı.",
      Data = response,
      StatusCode = 201
    };
  }

  public async Task<ReturnModel<AuthenticationResult>> RefreshTokenAsync(
    string? refreshToken,
    string? ipAddress,
    CancellationToken cancellationToken)
  {
    _logger.LogInformation("Oturum tazeleme işlemi(Refresh Token) başlatıldı.");

    var rotation = await _refreshTokenService.ValidateAndRotateAsync(refreshToken, ipAddress, cancellationToken);

    _authBusinessRules.RefreshTokenMustBeValid(rotation);

    // Defense in depth: RefreshTokenService already rejects inactive users before rotating, but
    // an independent re-check here means a future change to that internal check can never, by
    // itself, silently let a deactivated account keep refreshing.
    _userBusinessRules.UserAccountMustBeActive(rotation.User!);

    var response = CreateToken(rotation.User!, rotation.RawToken!, rotation.ExpiresAt);

    _logger.LogInformation("Oturum başarıyla tazelendi. Kullanıcı ID: {UserId}", rotation.User!.Id);

    return new ReturnModel<AuthenticationResult>()
    {
      Data = response,
      Success = true,
      StatusCode = 200,
      Message = "Oturum tazelendi."
    };
  }

  public async Task LogoutAsync(
    string? refreshToken,
    string? ipAddress,
    CancellationToken cancellationToken)
  {
    _logger.LogInformation("Oturum kapatma isteği alındı.");

    await _refreshTokenService.RevokeAsync(refreshToken, ipAddress, cancellationToken);

    _logger.LogInformation("Oturum sonlandırma isteği işlendi (idempotent).");
  }

  private AuthenticationResult CreateToken(
    User user,
    string rawRefreshToken,
    DateTime refreshTokenExpiresAt)
  {
    var claims = new List<Claim>()
    {
      new(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new(ClaimTypes.Email, user.Email),
      new(ClaimTypes.Name, user.Username)
    };

    if (user.UserRoles != null)
    {
      foreach (var userRole in user.UserRoles.Where(ur => ur.Role != null))
      {
        claims.Add(new Claim(ClaimTypes.Role, userRole.Role.Name));
      }
    }

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SecurityKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
    var expiration = DateTime.UtcNow.AddMinutes(_options.AccessTokenExpiration);

    var token = new JwtSecurityToken(
      issuer: _options.Issuer,
      audience: _options.Audience,
      claims: claims,
      expires: expiration,
      signingCredentials: creds);

    var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

    var response = new TokenResponseDto(
      accessToken,
      expiration,
      _mapper.EntityToResponseDto(user));

    return new AuthenticationResult(response, rawRefreshToken, refreshTokenExpiresAt);
  }
}
