using Api.Core.Entities;
using Api.Features.Users;

namespace Api.Features.Authentication;

/// <summary>
/// One issued refresh token. A login starts a new <see cref="FamilyId"/>; every rotation within
/// that family keeps the same FamilyId, chaining via <see cref="ReplacedByTokenId"/>. Rows are
/// never deleted by application code — revoked/expired rows are the lineage replay detection
/// depends on (see retention notes on <see cref="IRefreshTokenRepository"/>).
/// </summary>
public class RefreshToken : Entity<Guid>
{
  public RefreshToken()
  {
  }

  public RefreshToken(Guid id) : base(id)
  {
  }

  public Guid UserId { get; set; }
  public Guid FamilyId { get; set; }

  /// <summary>Lowercase 64-character hex SHA-256 digest of the raw token. Never the raw value.</summary>
  public string TokenHash { get; set; } = default!;

  /// <summary>Idle expiry — refreshed on every rotation, capped by <see cref="AbsoluteExpiresAt"/>.</summary>
  public DateTime ExpiresAt { get; set; }

  /// <summary>Fixed at the login that started this family; copied unchanged across rotations.</summary>
  public DateTime AbsoluteExpiresAt { get; set; }

  public DateTime? RevokedAt { get; set; }
  public Guid? ReplacedByTokenId { get; set; }
  public string? CreatedByIp { get; set; }
  public string? RevokedByIp { get; set; }

  /// <summary>"Rotated" | "ReuseDetected" | "LoggedOut" | "PasswordChanged" | "UserDeactivated"</summary>
  public string? ReasonRevoked { get; set; }

  public virtual User User { get; set; } = default!;
  public virtual RefreshToken? ReplacedByToken { get; set; }
}
