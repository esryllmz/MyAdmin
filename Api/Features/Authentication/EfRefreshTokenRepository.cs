using Api.Core.Repositories;
using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Authentication;

public class EfRefreshTokenRepository : EfBaseRepository<BaseDbContext, RefreshToken, Guid>, IRefreshTokenRepository
{
  public EfRefreshTokenRepository(BaseDbContext context) : base(context)
  {
  }

  public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
  {
    return await _context.RefreshTokens
      .Include(rt => rt.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role)
      .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);
  }

  public async Task LinkReplacedByTokenIdAsync(
    Guid tokenId,
    Guid replacedByTokenId,
    CancellationToken cancellationToken = default)
  {
    await _context.RefreshTokens
      .Where(rt => rt.Id == tokenId)
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(rt => rt.ReplacedByTokenId, replacedByTokenId),
        cancellationToken);
  }

  public async Task<int> TryRevokeAsync(
    Guid tokenId,
    DateTime revokedAt,
    string? revokedByIp,
    string reason,
    CancellationToken cancellationToken = default)
  {
    return await _context.RefreshTokens
      .Where(rt => rt.Id == tokenId && rt.RevokedAt == null)
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(rt => rt.RevokedAt, revokedAt)
        .SetProperty(rt => rt.RevokedByIp, revokedByIp)
        .SetProperty(rt => rt.ReasonRevoked, reason),
        cancellationToken);
  }

  public async Task<int> RevokeActiveFamilyAsync(
    Guid familyId,
    DateTime revokedAt,
    string? revokedByIp,
    string reason,
    CancellationToken cancellationToken = default)
  {
    return await _context.RefreshTokens
      .Where(rt => rt.FamilyId == familyId && rt.RevokedAt == null)
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(rt => rt.RevokedAt, revokedAt)
        .SetProperty(rt => rt.RevokedByIp, revokedByIp)
        .SetProperty(rt => rt.ReasonRevoked, reason),
        cancellationToken);
  }

  public async Task<int> RevokeAllActiveForUserAsync(
    Guid userId,
    DateTime revokedAt,
    string reason,
    CancellationToken cancellationToken = default)
  {
    return await _context.RefreshTokens
      .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(rt => rt.RevokedAt, revokedAt)
        .SetProperty(rt => rt.ReasonRevoked, reason),
        cancellationToken);
  }
}
