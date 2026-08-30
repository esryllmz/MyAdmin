using Api.Core.Repositories;

namespace Api.Features.Authentication;

public interface IRefreshTokenRepository : IRepository<RefreshToken, Guid>
{
  /// <summary>
  /// Tracked read, including the owning User (+ roles), by exact TokenHash match.
  /// </summary>
  Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);

  /// <summary>
  /// Atomically revokes a single row (no successor linked yet) — ONLY if the row is still
  /// un-revoked at the moment the UPDATE runs. Returns the affected row count (0 or 1). Used both
  /// for logout (reason "LoggedOut") and as the rotation-claim step (reason "Rotated") — the
  /// caller must win this claim BEFORE creating any child row, so a losing concurrent caller
  /// never leaves an orphan RefreshToken behind.
  /// </summary>
  Task<int> TryRevokeAsync(
    Guid tokenId,
    DateTime revokedAt,
    string? revokedByIp,
    string reason,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// Links a token's successor once the caller has already exclusively claimed it via
  /// TryRevokeAsync — no concurrency guard needed here since only the claim winner ever calls
  /// this, on a row it alone holds within its own transaction.
  /// </summary>
  Task LinkReplacedByTokenIdAsync(
    Guid tokenId,
    Guid replacedByTokenId,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// Revokes every still-active (RevokedAt IS NULL) token in a family in one statement. Used for
  /// replay detection (reuse of an already-rotated token forces the whole family to re-login).
  /// </summary>
  Task<int> RevokeActiveFamilyAsync(
    Guid familyId,
    DateTime revokedAt,
    string? revokedByIp,
    string reason,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// Revokes every still-active token across every family for a user. Used for security events
  /// (password change, deactivation) that must end every session, not just one family.
  /// </summary>
  Task<int> RevokeAllActiveForUserAsync(
    Guid userId,
    DateTime revokedAt,
    string reason,
    CancellationToken cancellationToken = default);
}
