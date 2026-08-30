using Api.Features.Users;

namespace Api.Features.Authentication;

/// <summary>
/// Deliberately opaque about *why* validation failed (unknown hash, expired, revoked, replayed,
/// inactive user, absolute-lifetime exceeded) — every failure reason maps to the same generic
/// "session invalid" outcome so the HTTP response can't be used to distinguish them. The reason
/// is only ever recorded in server-side logs, not in this result.
/// </summary>
public sealed class RefreshTokenRotationResult
{
  public bool IsValid { get; private init; }
  public User? User { get; private init; }
  public string? RawToken { get; private init; }
  public DateTime ExpiresAt { get; private init; }

  public static RefreshTokenRotationResult Invalid { get; } = new() { IsValid = false };

  public static RefreshTokenRotationResult Rotated(User user, string rawToken, DateTime expiresAt) => new()
  {
    IsValid = true,
    User = user,
    RawToken = rawToken,
    ExpiresAt = expiresAt
  };
}
