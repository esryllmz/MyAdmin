using Api.Core.Exceptions;
using Api.Core.Repositories;
using Api.Core.Security;
using Api.Features.Authentication;
using Api.Features.Roles;
using Api.Features.UserRoles;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using System.Security.Cryptography;
using System.Text;
using TokenOptions = Api.Core.Security.TokenOptions;

namespace Api.Tests.Unit.Features.Authentication;

public class AuthenticationServiceTests
{
  private readonly Mock<IUserRepository> _userRepository = new();
  private readonly Mock<IRoleRepository> _roleRepository = new();
  private readonly Mock<IRefreshTokenService> _refreshTokenService = new();
  private readonly Mock<IUnitOfWork> _unitOfWork = new();
  private readonly IPasswordService<User> _realPasswordService =
    new PasswordService<User>(new PasswordHasher<User>(Options.Create(new PasswordHasherOptions())));

  private readonly TokenOptions _options = new()
  {
    Issuer = "test-issuer",
    Audience = "test-audience",
    AccessTokenExpiration = 30,
    RefreshTokenExpiration = 7,
    RefreshTokenAbsoluteLifetimeDays = 30,
    SecurityKey = new string('a', 64),
  };

  private AuthenticationService CreateService(IPasswordService<User>? passwordService = null)
  {
    var effectivePasswordService = passwordService ?? _realPasswordService;

    var userBusinessRules = new UserBusinessRules(_userRepository.Object, effectivePasswordService, NullLogger<UserBusinessRules>.Instance);
    var authBusinessRules = new AuthenticationBusinessRules(NullLogger<AuthenticationBusinessRules>.Instance);

    return new AuthenticationService(
      _userRepository.Object,
      _roleRepository.Object,
      userBusinessRules,
      authBusinessRules,
      _refreshTokenService.Object,
      effectivePasswordService,
      new UserMapper(),
      _unitOfWork.Object,
      new RegisterUserRequestValidator(),
      new RegisterUserRequestValidator.LoginRequestValidator(),
      Options.Create(_options),
      NullLogger<AuthenticationService>.Instance);
  }

  private static (string Hash, string Key) CreateLegacyHash(string password)
  {
    using var hmac = new HMACSHA512();
    var key = Convert.ToBase64String(hmac.Key);
    var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
    return (hash, key);
  }

  private User CreateModernUser(string password, bool isActive = true)
  {
    var user = new User
    {
      Username = "viewer",
      Email = "viewer@example.com",
      PasswordHash = string.Empty,
      IsActive = isActive,
    };
    user.PasswordHash = _realPasswordService.HashPassword(user, password);
    return user;
  }

  private void SetupUserLookup(User? user)
  {
    _userRepository
      .Setup(r => r.GetAsync(
        It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>(),
        It.IsAny<Func<IQueryable<User>, IQueryable<User>>?>(),
        It.IsAny<bool>(),
        It.IsAny<CancellationToken>()))
      .ReturnsAsync(user);
  }

  private void SetupSuccessfulIssue()
  {
    _refreshTokenService
      .Setup(s => s.IssueAsync(It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync((Guid userId, string? _, CancellationToken _) =>
        (new RefreshToken(Guid.NewGuid())
        {
          UserId = userId,
          FamilyId = Guid.NewGuid(),
          TokenHash = "irrelevant",
          ExpiresAt = DateTime.UtcNow.AddDays(7),
          AbsoluteExpiresAt = DateTime.UtcNow.AddDays(30),
        }, "raw-refresh-token"));
  }

  [Fact]
  public async Task LoginAsync_CorrectCredentials_ReturnsTokenAndIssuesRefreshToken()
  {
    var user = CreateModernUser("Correct-Horse-1!");
    SetupUserLookup(user);
    SetupSuccessfulIssue();

    var result = await CreateService().LoginAsync(new LoginRequest(user.Email, "Correct-Horse-1!"), "1.1.1.1", CancellationToken.None);

    Assert.True(result.Success);
    Assert.NotNull(result.Data);
    Assert.Equal("raw-refresh-token", result.Data!.RawRefreshToken);
    _refreshTokenService.Verify(s => s.IssueAsync(user.Id, "1.1.1.1", It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task LoginAsync_WrongPassword_ThrowsAuthorizationException()
  {
    var user = CreateModernUser("Correct-Horse-1!");
    SetupUserLookup(user);

    var ex = await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().LoginAsync(new LoginRequest(user.Email, "wrong-password"), null, CancellationToken.None));

    Assert.Equal("E-posta veya şifre hatalı.", ex.Message);
  }

  [Fact]
  public async Task LoginAsync_NonexistentEmail_ThrowsSameFailureAsWrongPassword()
  {
    SetupUserLookup(null);

    var ex = await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().LoginAsync(new LoginRequest("nobody@example.com", "anything"), null, CancellationToken.None));

    Assert.Equal("E-posta veya şifre hatalı.", ex.Message);
  }

  [Fact]
  public async Task LoginAsync_InactiveUser_ThrowsAuthorizationException_EvenWithCorrectPassword()
  {
    var user = CreateModernUser("Correct-Horse-1!", isActive: false);
    SetupUserLookup(user);

    await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().LoginAsync(new LoginRequest(user.Email, "Correct-Horse-1!"), null, CancellationToken.None));

    _refreshTokenService.Verify(s => s.IssueAsync(It.IsAny<Guid>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task LoginAsync_LegacyPassword_CorrectCredentials_UpgradesHashAndClearsPasswordKey()
  {
    var (legacyHash, legacyKey) = CreateLegacyHash("Correct-Horse-1!");
    var user = new User { Username = "legacy", Email = "legacy@example.com", PasswordHash = legacyHash, PasswordKey = legacyKey, IsActive = true };
    SetupUserLookup(user);
    SetupSuccessfulIssue();

    await CreateService().LoginAsync(new LoginRequest(user.Email, "Correct-Horse-1!"), null, CancellationToken.None);

    Assert.Null(user.PasswordKey);
    Assert.NotEqual(legacyHash, user.PasswordHash);
    Assert.Equal(PasswordVerificationOutcome.Success, _realPasswordService.VerifyModern(user, user.PasswordHash, "Correct-Horse-1!"));
    _userRepository.Verify(r => r.Update(user), Times.Once);
  }

  [Fact]
  public async Task LoginAsync_LegacyPassword_WrongPassword_DoesNotMutateCredentials()
  {
    var (legacyHash, legacyKey) = CreateLegacyHash("Correct-Horse-1!");
    var user = new User { Username = "legacy", Email = "legacy@example.com", PasswordHash = legacyHash, PasswordKey = legacyKey, IsActive = true };
    SetupUserLookup(user);

    await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().LoginAsync(new LoginRequest(user.Email, "wrong-password"), null, CancellationToken.None));

    Assert.Equal(legacyHash, user.PasswordHash);
    Assert.Equal(legacyKey, user.PasswordKey);
    _userRepository.Verify(r => r.Update(It.IsAny<User>()), Times.Never);
  }

  [Fact]
  public async Task LoginAsync_ModernHash_SuccessRehashNeeded_UpgradesHash()
  {
    var user = new User { Username = "modern", Email = "modern@example.com", PasswordHash = "existing-hash", IsActive = true };
    SetupUserLookup(user);
    SetupSuccessfulIssue();

    var fakePasswordService = new Mock<IPasswordService<User>>();
    fakePasswordService
      .Setup(s => s.VerifyModern(user, user.PasswordHash, "Correct-Horse-1!"))
      .Returns(PasswordVerificationOutcome.SuccessRehashNeeded);
    fakePasswordService
      .Setup(s => s.HashPassword(user, "Correct-Horse-1!"))
      .Returns("new-stronger-hash");

    await CreateService(fakePasswordService.Object).LoginAsync(new LoginRequest(user.Email, "Correct-Horse-1!"), null, CancellationToken.None);

    Assert.Equal("new-stronger-hash", user.PasswordHash);
    fakePasswordService.Verify(s => s.HashPassword(user, "Correct-Horse-1!"), Times.Once);
  }

  [Fact]
  public async Task RefreshTokenAsync_InvalidRotationResult_ThrowsAuthorizationException()
  {
    _refreshTokenService
      .Setup(s => s.ValidateAndRotateAsync(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(RefreshTokenRotationResult.Invalid);

    await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().RefreshTokenAsync("some-token", null, CancellationToken.None));
  }

  [Fact]
  public async Task RefreshTokenAsync_ValidRotation_ReturnsNewToken()
  {
    var user = CreateModernUser("irrelevant");
    var rotated = RefreshTokenRotationResult.Rotated(user, "new-raw-token", DateTime.UtcNow.AddDays(7));

    _refreshTokenService
      .Setup(s => s.ValidateAndRotateAsync("old-token", null, It.IsAny<CancellationToken>()))
      .ReturnsAsync(rotated);

    var result = await CreateService().RefreshTokenAsync("old-token", null, CancellationToken.None);

    Assert.True(result.Success);
    Assert.Equal("new-raw-token", result.Data!.RawRefreshToken);
  }

  [Fact]
  public async Task RefreshTokenAsync_RotatedResultForInactiveUser_ThrowsAuthorizationException()
  {
    // Defense in depth: even if RefreshTokenService's own internal check were ever bypassed,
    // AuthenticationService must independently refuse to issue tokens for an inactive user.
    var inactiveUser = CreateModernUser("irrelevant", isActive: false);
    var rotated = RefreshTokenRotationResult.Rotated(inactiveUser, "new-raw-token", DateTime.UtcNow.AddDays(7));

    _refreshTokenService
      .Setup(s => s.ValidateAndRotateAsync(It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync(rotated);

    await Assert.ThrowsAsync<AuthorizationException>(
      () => CreateService().RefreshTokenAsync("token", null, CancellationToken.None));
  }

  [Fact]
  public async Task LogoutAsync_AlwaysDelegatesToRefreshTokenService_AndCompletes()
  {
    await CreateService().LogoutAsync("some-token", "9.9.9.9", CancellationToken.None);

    _refreshTokenService.Verify(s => s.RevokeAsync("some-token", "9.9.9.9", It.IsAny<CancellationToken>()), Times.Once);
  }
}
