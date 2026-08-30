using Api.Core.Exceptions;
using Api.Core.Security;

namespace Api.Features.Users;

public class UserBusinessRules(
  IUserRepository _userRepository,
  IPasswordService<User> _passwordService,
  ILogger<UserBusinessRules> _logger)
{
  /// <summary>
  /// Verifies a password against whichever scheme the user's row is currently on. Pure
  /// verification only — never mutates or persists. The caller (application service) decides
  /// what to do with a LegacyUpgradeNeeded/SuccessRehashNeeded outcome.
  /// </summary>
  public PasswordVerificationOutcome VerifyPassword(User user, string password)
  {
    if (user.PasswordKey != null)
    {
      return LegacyPasswordHasher.VerifyPasswordHash(password, user.PasswordHash, user.PasswordKey)
        ? PasswordVerificationOutcome.LegacyUpgradeNeeded
        : PasswordVerificationOutcome.Failed;
    }

    return _passwordService.VerifyModern(user, user.PasswordHash, password);
  }

  public async Task<User> GetUserIfExistAsync(
    Guid id,
    Func<IQueryable<User>, IQueryable<User>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default)
  {
    var user = await _userRepository.GetByIdAsync(id, include, enableTracking, cancellationToken);

    if (user == null)
    {
      _logger.LogWarning("Kullanıcı bulunamadı. ID: {UserId}", id);

      throw new NotFoundException($"{id} numaralı kullanıcı bulunamadı.");
    }

    return user;
  }

  public async Task UserIdMustExist(Guid userId, CancellationToken cancellationToken)
  {
    bool exists = await _userRepository.AnyAsync(u => u.Id == userId, cancellationToken);

    if (!exists)
    {
      _logger.LogWarning("Kullanıcı varlık kontrolü başarısız. ID: {UserId}", userId);

      throw new NotFoundException($"{userId} numaralı kullanıcı bulunamadı.");
    }
  }

  public async Task EmailMustBeUniqueAsync(string email, Guid? id = null, CancellationToken cancellationToken = default)
  {
    var exists = await _userRepository.AnyAsync(u => u.Email == email && (id == null || u.Id != id), cancellationToken);

    if (exists)
    {
      _logger.LogWarning("E-posta zaten kullanımda: {Email}", email);

      throw new ConflictException("Bu eposta adresi zaten kullanımda.");
    }
  }

  public async Task UsernameMustBeUniqueAsync(string username, Guid? id = null, CancellationToken cancellationToken = default)
  {
    var exists = await _userRepository.AnyAsync(u => u.Username == username && (id == null || u.Id != id), cancellationToken);

    if (exists)
    {
      _logger.LogWarning("Kullanıcı adı alınmış: {Username}", username);

      throw new ConflictException("Bu kullanıcı adı zaten alınmış.");
    }
  }

  /// <summary>
  /// Viewer has no management mandate over any other account — GetById previously had no
  /// ownership check at all, letting any authenticated Viewer read any other user's profile by
  /// guessing an ID. Editor/Admin are exempt (they have their own, separate target-role checks).
  /// </summary>
  public void ViewerMayOnlyViewSelf(string callerRole, Guid callerUserId, Guid targetUserId)
  {
    if (callerRole != "Viewer" || targetUserId == callerUserId)
    {
      return;
    }

    _logger.LogWarning(
      "Viewer attempted to view another user's profile. Requester: {CallerUserId}, Target: {TargetUserId}",
      callerUserId, targetUserId);

    throw new ForbiddenException("You can only view your own profile.");
  }

  /// <summary>
  /// Editor's mandate is Viewer-account operations only. When an Editor targets someone other
  /// than themselves (edit profile, activate/deactivate), the target must hold the Viewer
  /// application role — this blocks an Editor from editing or deactivating an Admin or another
  /// Editor account, which is a real privilege-escalation/denial-of-service vector otherwise.
  /// Admin is exempt; self-targeting is always exempt (handled by the caller).
  /// </summary>
  public void EditorMayOnlyTargetViewerUsers(string callerRole, User targetUser)
  {
    if (callerRole != "Editor")
    {
      return;
    }

    var targetApplicationRole = targetUser.UserRoles?.Select(ur => ur.Role?.Name).FirstOrDefault(name => name != null);

    if (targetApplicationRole != "Viewer")
    {
      _logger.LogWarning(
        "Editor attempted to manage a non-Viewer account. Target: {TargetUserId}, TargetRole: {TargetRole}",
        targetUser.Id, targetApplicationRole);

      throw new ForbiddenException("Editors can only manage Viewer accounts.");
    }
  }

  public void UserMustBeOwnerOrAdmin(Guid requestTargetId, Guid currentUserId, string userRole)
  {
    if (requestTargetId != currentUserId && userRole != "Admin")
    {
      _logger.LogWarning("Yetkisiz işlem denemesi! Hedef Kullanıcı: {TargetId}, İşlemi Yapan: {CurrentUserId}, Rol: {UserRole}",
          requestTargetId, currentUserId, userRole);

      throw new ForbiddenException("Bu işlem için yetkiniz bulunmamaktadır.");
    }
  }

  public void PasswordMustMatch(PasswordVerificationOutcome outcome)
  {
    if (outcome == PasswordVerificationOutcome.Failed)
    {
      _logger.LogWarning("Hatalı mevcut şifre denemesi yapıldı.");

      throw new BusinessException("Mevcut şifreniz hatalı.");
    }
  }

  public void UserCannotDeactivateSelf(Guid targetUserId, Guid currentUserId, bool isActive)
  {
    if (!isActive && targetUserId == currentUserId)
    {
      _logger.LogWarning("Kullanıcı kendi hesabını pasifleştirmeye çalıştı. ID: {UserId}", currentUserId);

      throw new BusinessException("Kendi hesabınızı pasifleştiremezsiniz.");
    }
  }

  public void UserAccountMustBeActive(User user)
  {
    if (!user.IsActive)
    {
      _logger.LogWarning("Dondurulmuş hesaba erişim denemesi yakalandı. Kullanıcı ID: {UserId}", user.Id);

      throw new AuthorizationException("Hesabınız dondurulmuştur. Lütfen sistem yöneticisi ile iletişime geçin.");
    }
  }
  public void NewPasswordCannotBeSameAsOld(PasswordVerificationOutcome outcomeForNewPasswordAgainstOldHash)
  {
    if (outcomeForNewPasswordAgainstOldHash != PasswordVerificationOutcome.Failed)
    {
      _logger.LogWarning("Kullanıcı yeni şifresini eskisiyle aynı yapmaya çalıştı.");

      throw new BusinessException("Yeni şifreniz eski şifrenizle aynı olamaz.");
    }
  }
}
