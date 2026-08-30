using Api.Core.Exceptions;
using Api.Core.Security;
using Api.Features.Users;

namespace Api.Features.Authentication;

public class AuthenticationBusinessRules(ILogger<AuthenticationBusinessRules> _logger)
{
  private const string GenericSessionInvalidMessage = "Oturum süresi dolmuş, lütfen tekrar giriş yapın.";

  public void UserCredentialsMustMatch(
    User? user,
    PasswordVerificationOutcome outcome)
  {
    if (user == null || outcome == PasswordVerificationOutcome.Failed)
    {
      _logger.LogWarning("Hatalı giriş denemesi: {Email}", user?.Email);

      throw new AuthorizationException("E-posta veya şifre hatalı.");
    }
  }

  /// <summary>
  /// Deliberately generic: whether the token was unknown, expired, revoked, replayed, or
  /// belonged to a now-inactive user, the caller sees the exact same message. The distinguishing
  /// reason lives only in server-side logs (see RefreshTokenService), never in the HTTP response.
  /// </summary>
  public void RefreshTokenMustBeValid(RefreshTokenRotationResult result)
  {
    if (!result.IsValid)
    {
      _logger.LogWarning("Geçersiz veya tekrar kullanılmış bir refresh token denemesi reddedildi.");

      throw new AuthorizationException(GenericSessionInvalidMessage);
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
