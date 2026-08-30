using Api.Core.Repositories;
using Api.Core.Security;
using Microsoft.Extensions.Options;

namespace Api.Features.Authentication;

public class RefreshTokenService(
  IRefreshTokenRepository _refreshTokenRepository,
  IUnitOfWork _unitOfWork,
  IOptions<TokenOptions> _tokenOptions,
  ILogger<RefreshTokenService> _logger) : IRefreshTokenService
{
  private readonly TokenOptions _options = _tokenOptions.Value;

  public async Task<(RefreshToken Token, string RawToken)> IssueAsync(
    Guid userId,
    string? ipAddress,
    CancellationToken cancellationToken = default)
  {
    var now = DateTime.UtcNow;
    var rawToken = RefreshTokenGenerator.Generate();

    var token = new RefreshToken(Guid.NewGuid())
    {
      UserId = userId,
      FamilyId = Guid.NewGuid(),
      TokenHash = TokenHasher.Hash(rawToken),
      ExpiresAt = now.AddDays(_options.RefreshTokenExpiration),
      AbsoluteExpiresAt = now.AddDays(_options.RefreshTokenAbsoluteLifetimeDays),
      CreatedByIp = ipAddress
    };

    await _refreshTokenRepository.AddAsync(token, cancellationToken);

    return (token, rawToken);
  }

  public async Task<RefreshTokenRotationResult> ValidateAndRotateAsync(
    string? rawToken,
    string? ipAddress,
    CancellationToken cancellationToken = default)
  {
    if (string.IsNullOrWhiteSpace(rawToken))
    {
      _logger.LogWarning("Refresh attempted with no token presented.");

      return RefreshTokenRotationResult.Invalid;
    }

    var tokenHash = TokenHasher.Hash(rawToken);
    var row = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);
    var now = DateTime.UtcNow;

    if (row == null)
    {
      _logger.LogWarning("Refresh attempted with an unrecognized token hash.");

      return RefreshTokenRotationResult.Invalid;
    }

    if (row.RevokedAt != null)
    {
      await _refreshTokenRepository.RevokeActiveFamilyAsync(row.FamilyId, now, ipAddress, "ReuseDetected", cancellationToken);

      _logger.LogWarning(
        "Refresh token reuse detected — entire family revoked. UserId={UserId} FamilyId={FamilyId}",
        row.UserId, row.FamilyId);

      return RefreshTokenRotationResult.Invalid;
    }

    if (row.ExpiresAt <= now || row.AbsoluteExpiresAt <= now)
    {
      _logger.LogInformation(
        "Refresh token expired. UserId={UserId} FamilyId={FamilyId} Absolute={IsAbsolute}",
        row.UserId, row.FamilyId, row.AbsoluteExpiresAt <= now);

      return RefreshTokenRotationResult.Invalid;
    }

    if (!row.User.IsActive)
    {
      _logger.LogWarning("Refresh attempted for an inactive user. UserId={UserId}", row.UserId);

      return RefreshTokenRotationResult.Invalid;
    }

    var newTokenId = Guid.NewGuid();
    var newRawToken = RefreshTokenGenerator.Generate();
    var newExpiresAt = now.AddDays(_options.RefreshTokenExpiration) < row.AbsoluteExpiresAt
      ? now.AddDays(_options.RefreshTokenExpiration)
      : row.AbsoluteExpiresAt;

    await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

    // Claim the rotation FIRST, before creating anything. Only the caller that wins this atomic
    // conditional update may go on to create a child row — this is what guarantees a losing
    // concurrent caller never leaves an orphan RefreshToken behind.
    var claimed = await _refreshTokenRepository.TryRevokeAsync(row.Id, now, ipAddress, "Rotated", cancellationToken);

    if (claimed == 0)
    {
      // Lost a concurrent-rotation race, or the token was revoked between our read and our write —
      // either way, someone else just consumed this exact token. Treat identically to replay: the
      // safe default when two callers present the same "still valid as of a moment ago" token is
      // to end the whole family, not to silently let the loser fail with no consequence.
      await _refreshTokenRepository.RevokeActiveFamilyAsync(row.FamilyId, now, ipAddress, "ReuseDetected", cancellationToken);
      await transaction.CommitAsync(cancellationToken);

      _logger.LogWarning(
        "Concurrent refresh collision treated as reuse. UserId={UserId} FamilyId={FamilyId}",
        row.UserId, row.FamilyId);

      return RefreshTokenRotationResult.Invalid;
    }

    // We've exclusively won the claim — safe to create the child and link it. No FK ordering
    // issue: the child is inserted before the link, and no one else can race us for this row.
    var newToken = new RefreshToken(newTokenId)
    {
      UserId = row.UserId,
      FamilyId = row.FamilyId,
      TokenHash = TokenHasher.Hash(newRawToken),
      ExpiresAt = newExpiresAt,
      AbsoluteExpiresAt = row.AbsoluteExpiresAt,
      CreatedByIp = ipAddress
    };

    await _refreshTokenRepository.AddAsync(newToken, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);
    await _refreshTokenRepository.LinkReplacedByTokenIdAsync(row.Id, newTokenId, cancellationToken);

    await transaction.CommitAsync(cancellationToken);

    return RefreshTokenRotationResult.Rotated(row.User, newRawToken, newExpiresAt);
  }

  public async Task RevokeAsync(
    string? rawToken,
    string? ipAddress,
    CancellationToken cancellationToken = default)
  {
    if (string.IsNullOrWhiteSpace(rawToken))
    {
      return;
    }

    var tokenHash = TokenHasher.Hash(rawToken);
    var row = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

    if (row == null || row.RevokedAt != null)
    {
      return;
    }

    await _refreshTokenRepository.TryRevokeAsync(row.Id, DateTime.UtcNow, ipAddress, "LoggedOut", cancellationToken);
  }

  public async Task RevokeAllActiveFamiliesForUserAsync(
    Guid userId,
    string reason,
    CancellationToken cancellationToken = default)
  {
    await _refreshTokenRepository.RevokeAllActiveForUserAsync(userId, DateTime.UtcNow, reason, cancellationToken);
  }
}
