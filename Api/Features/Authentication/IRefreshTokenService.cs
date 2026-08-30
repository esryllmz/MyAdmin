namespace Api.Features.Authentication;

public interface IRefreshTokenService
{
  /// <summary>Starts a brand-new token family (a new login/session). Stages the insert; caller saves.</summary>
  Task<(RefreshToken Token, string RawToken)> IssueAsync(
    Guid userId,
    string? ipAddress,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// Validates the presented raw token and, if valid, atomically rotates it. Reuse of an
  /// already-rotated token (or losing a concurrent-rotation race) revokes the whole family.
  /// </summary>
  Task<RefreshTokenRotationResult> ValidateAndRotateAsync(
    string? rawToken,
    string? ipAddress,
    CancellationToken cancellationToken = default);

  /// <summary>Idempotent: missing/unknown/already-revoked tokens are all a no-op success.</summary>
  Task RevokeAsync(
    string? rawToken,
    string? ipAddress,
    CancellationToken cancellationToken = default);

  /// <summary>Ends every active session for a user, across every family (password change, deactivation).</summary>
  Task RevokeAllActiveFamiliesForUserAsync(
    Guid userId,
    string reason,
    CancellationToken cancellationToken = default);
}
