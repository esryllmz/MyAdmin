using Api.Core.Repositories;
using Api.Core.Security;
using Api.Features.Authentication;
using Api.Features.Users;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using TokenOptions = Api.Core.Security.TokenOptions;

namespace Api.Tests.Unit.Features.Authentication;

public class RefreshTokenServiceTests
{
  private readonly Mock<IRefreshTokenRepository> _repository = new();
  private readonly Mock<IUnitOfWork> _unitOfWork = new();
  private readonly TokenOptions _options = new()
  {
    Issuer = "test",
    Audience = "test",
    AccessTokenExpiration = 30,
    RefreshTokenExpiration = 7,
    RefreshTokenAbsoluteLifetimeDays = 30,
    SecurityKey = new string('a', 64),
  };

  private RefreshTokenService CreateService()
  {
    _unitOfWork
      .Setup(u => u.BeginTransactionAsync(It.IsAny<CancellationToken>()))
      .ReturnsAsync(Mock.Of<IDbContextTransaction>());

    return new RefreshTokenService(
      _repository.Object,
      _unitOfWork.Object,
      Options.Create(_options),
      NullLogger<RefreshTokenService>.Instance);
  }

  private static User CreateActiveUser() => new()
  {
    Username = "viewer",
    Email = "viewer@example.com",
    PasswordHash = "irrelevant",
    IsActive = true,
  };

  private static RefreshToken CreateRow(User user, Action<RefreshToken>? mutate = null)
  {
    var row = new RefreshToken(Guid.NewGuid())
    {
      UserId = user.Id,
      FamilyId = Guid.NewGuid(),
      TokenHash = TokenHasher.Hash("irrelevant-raw-value"),
      ExpiresAt = DateTime.UtcNow.AddDays(1),
      AbsoluteExpiresAt = DateTime.UtcNow.AddDays(10),
      User = user,
    };

    mutate?.Invoke(row);

    return row;
  }

  [Fact]
  public async Task ValidateAndRotateAsync_NullToken_ReturnsInvalid_WithoutQueryingRepository()
  {
    var service = CreateService();

    var result = await service.ValidateAndRotateAsync(null, ipAddress: null, CancellationToken.None);

    Assert.False(result.IsValid);
    _repository.Verify(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_UnknownTokenHash_ReturnsInvalid()
  {
    _repository
      .Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
      .ReturnsAsync((RefreshToken?)null);

    var result = await CreateService().ValidateAndRotateAsync("some-raw-token", null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_AlreadyRevokedToken_RevokesEntireFamily_ReturnsInvalid()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user, r => r.RevokedAt = DateTime.UtcNow.AddMinutes(-1));

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    var result = await CreateService().ValidateAndRotateAsync("stale-token", null, CancellationToken.None);

    Assert.False(result.IsValid);
    _repository.Verify(r => r.RevokeActiveFamilyAsync(row.FamilyId, It.IsAny<DateTime>(), null, "ReuseDetected", It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_ExpiredToken_ReturnsInvalid_DoesNotRevokeFamily()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user, r => r.ExpiresAt = DateTime.UtcNow.AddMinutes(-1));

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    var result = await CreateService().ValidateAndRotateAsync("expired-token", null, CancellationToken.None);

    Assert.False(result.IsValid);
    _repository.Verify(r => r.RevokeActiveFamilyAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_AbsoluteExpiryReached_ReturnsInvalid_EvenIfIdleExpiryStillFuture()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user, r =>
    {
      r.ExpiresAt = DateTime.UtcNow.AddDays(3); // idle window still open
      r.AbsoluteExpiresAt = DateTime.UtcNow.AddMinutes(-1); // but the family is fully exhausted
    });

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    var result = await CreateService().ValidateAndRotateAsync("token", null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_InactiveUser_ReturnsInvalid()
  {
    var user = CreateActiveUser();
    user.IsActive = false;
    var row = CreateRow(user);

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    var result = await CreateService().ValidateAndRotateAsync("token", null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_ValidToken_RotatesAndReturnsNewRawToken()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user);

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);
    _repository
      .Setup(r => r.TryRevokeAsync(row.Id, It.IsAny<DateTime>(), It.IsAny<string?>(), "Rotated", It.IsAny<CancellationToken>()))
      .ReturnsAsync(1);

    var result = await CreateService().ValidateAndRotateAsync("token", "127.0.0.1", CancellationToken.None);

    Assert.True(result.IsValid);
    Assert.NotNull(result.RawToken);
    Assert.Same(user, result.User);

    _repository.Verify(r => r.AddAsync(It.Is<RefreshToken>(t => t.FamilyId == row.FamilyId && t.UserId == user.Id), It.IsAny<CancellationToken>()), Times.Once);
    _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    _repository.Verify(r => r.LinkReplacedByTokenIdAsync(row.Id, It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task ValidateAndRotateAsync_LosingConcurrentRotationRace_NeverCreatesAnOrphanChild()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user);

    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);
    _repository
      .Setup(r => r.TryRevokeAsync(row.Id, It.IsAny<DateTime>(), It.IsAny<string?>(), "Rotated", It.IsAny<CancellationToken>()))
      .ReturnsAsync(0); // someone else already claimed/revoked it a moment ago

    var result = await CreateService().ValidateAndRotateAsync("token", null, CancellationToken.None);

    Assert.False(result.IsValid);
    _repository.Verify(r => r.RevokeActiveFamilyAsync(row.FamilyId, It.IsAny<DateTime>(), null, "ReuseDetected", It.IsAny<CancellationToken>()), Times.Once);

    // The claim (TryRevokeAsync) must be attempted and lost BEFORE any child row is ever
    // created — a losing concurrent caller must never insert a RefreshToken row at all, orphaned
    // or otherwise.
    _repository.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()), Times.Never);
    _repository.Verify(r => r.LinkReplacedByTokenIdAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task IssueAsync_StagesNewFamily_WithIdleAndAbsoluteExpiry()
  {
    var userId = Guid.NewGuid();

    var (token, raw) = await CreateService().IssueAsync(userId, "10.0.0.1", CancellationToken.None);

    Assert.False(string.IsNullOrWhiteSpace(raw));
    Assert.Equal(userId, token.UserId);
    Assert.Equal(TokenHasher.Hash(raw), token.TokenHash);
    Assert.True(token.ExpiresAt <= token.AbsoluteExpiresAt);
    _repository.Verify(r => r.AddAsync(token, It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task RevokeAsync_UnknownToken_IsNoOp()
  {
    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((RefreshToken?)null);

    await CreateService().RevokeAsync("unknown", null, CancellationToken.None);

    _repository.Verify(r => r.TryRevokeAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task RevokeAsync_AlreadyRevoked_IsNoOp()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user, r => r.RevokedAt = DateTime.UtcNow);
    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    await CreateService().RevokeAsync("token", null, CancellationToken.None);

    _repository.Verify(r => r.TryRevokeAsync(It.IsAny<Guid>(), It.IsAny<DateTime>(), It.IsAny<string?>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task RevokeAsync_ValidToken_RevokesWithLoggedOutReason()
  {
    var user = CreateActiveUser();
    var row = CreateRow(user);
    _repository.Setup(r => r.GetByTokenHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync(row);

    await CreateService().RevokeAsync("token", "1.2.3.4", CancellationToken.None);

    _repository.Verify(r => r.TryRevokeAsync(row.Id, It.IsAny<DateTime>(), "1.2.3.4", "LoggedOut", It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task RevokeAllActiveFamiliesForUserAsync_DelegatesToRepository()
  {
    var userId = Guid.NewGuid();

    await CreateService().RevokeAllActiveFamiliesForUserAsync(userId, "PasswordChanged", CancellationToken.None);

    _repository.Verify(r => r.RevokeAllActiveForUserAsync(userId, It.IsAny<DateTime>(), "PasswordChanged", It.IsAny<CancellationToken>()), Times.Once);
  }
}
