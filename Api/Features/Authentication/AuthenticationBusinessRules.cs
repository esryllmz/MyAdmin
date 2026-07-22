using Api.Core.Exceptions;
using Api.Core.Security;
using Api.Features.Users;

namespace Api.Features.Authentication;

public class AuthenticationBusinessRules(ILogger<AuthenticationBusinessRules> _logger)
{
  public void UserCredentialsMustMatch(
    User? user,
    string password)
  {
    if (user == null ||
        string.IsNullOrWhiteSpace(user.PasswordHash) ||
        string.IsNullOrWhiteSpace(user.PasswordKey) ||
        !HashingHelper.VerifyPasswordHash(password, user.PasswordHash, user.PasswordKey))
    {
      _logger.LogWarning("Hatalı giriş denemesi: {Email}", user?.Email);

      throw new AuthorizationException("E-posta veya şifre hatalı.");
    }
  }

  public void RefreshTokenMustBeValid(
    User? user,
    string providedRefreshToken)
  {
    
    if (user == null)
    {
      _logger.LogWarning("Geçersiz Refresh Token denemesi: Kullanıcı bulunamadı.");

      throw new NotFoundException("Oturum bulunamadı.");
    }

    if (user.RefreshToken != providedRefreshToken)
    {
      _logger.LogWarning("Güvenlik Uyarısı: {UserId} idli kullanıcı için geçersiz Refresh Token kullanıldı.", user.Id);

      throw new AuthorizationException("Geçersiz oturum anahtarı.");
    }

    if (user.RefreshTokenExpiration < DateTime.UtcNow)
    {
      _logger.LogWarning("Oturum süresi dolmuş token denemesi. Kullanıcı: {UserId}", user.Id);

      throw new AuthorizationException("Oturum süresi dolmuş, lütfen tekrar giriş yapın.");
    }
  }

  public void RefreshTokenUserMustExist(User? user)
  {
    if (user == null)
    {
      _logger.LogWarning("Oturum sonlandırma başarısız: Token sahibi kullanıcı bulunamadı.");

      throw new NotFoundException("Token bulunamadı.");
    }
  }

  public void UserMustHavePermission(
    List<string> userPermissions,
    string requiredPermission)
  {
    if (!userPermissions.Contains(requiredPermission))
    {
      _logger.LogWarning("Yetkisiz erişim denemesi! Gerekli İzin: {Permission}", requiredPermission);

      throw new ForbiddenException($"Bu işlem için '{requiredPermission}' iznine sahip olmanız gerekir.");
    }
  }
}
