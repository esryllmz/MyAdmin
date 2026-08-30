using Api.Core.Security;
using Api.Data;
using Api.Features.Authentication;
using Api.Features.Users;
using Api.Tests.Integration.Fixtures;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;
using TokenOptions = Api.Core.Security.TokenOptions;

namespace Api.Tests.Integration;

[Collection("Integration")]
public class RefreshTokenRotationIntegrationTests(SqlServerFixture _fixture)
{
  private static readonly TokenOptions Options = new()
  {
    Issuer = "test",
    Audience = "test",
    AccessTokenExpiration = 30,
    RefreshTokenExpiration = 7,
    RefreshTokenAbsoluteLifetimeDays = 30,
    SecurityKey = new string('a', 64),
  };

  private RefreshTokenService CreateService(BaseDbContext context)
  {
    var repository = new EfRefreshTokenRepository(context);
    var unitOfWork = new UnitOfWork(context);
    return new RefreshTokenService(repository, unitOfWork, Microsoft.Extensions.Options.Options.Create(Options), NullLogger<RefreshTokenService>.Instance);
  }

  private async Task<User> CreateUserAsync(BaseDbContext context, bool isActive = true)
  {
    var user = new User
    {
      Username = $"user-{Guid.NewGuid():N}"[..20],
      Email = $"{Guid.NewGuid():N}@example.com",
      PasswordHash = "irrelevant-for-this-test",
      IsActive = isActive,
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    return user;
  }

  [Fact]
  public async Task ValidToken_RotatesExactlyOnce_LinksReplacedByTokenId_SameFamily()
  {
    await using var context = _fixture.CreateContext();
    var user = await CreateUserAsync(context);
    var service = CreateService(context);

    var (originalToken, rawA) = await service.IssueAsync(user.Id, "127.0.0.1", CancellationToken.None);
    await context.SaveChangesAsync();

    var rotation = await service.ValidateAndRotateAsync(rawA, "127.0.0.1", CancellationToken.None);

    Assert.True(rotation.IsValid);
    Assert.NotEqual(rawA, rotation.RawToken);

    await using var verifyContext = _fixture.CreateContext();
    var reloadedOriginal = await verifyContext.RefreshTokens.FindAsync(originalToken.Id);
    var newRows = verifyContext.RefreshTokens.Where(rt => rt.FamilyId == originalToken.FamilyId && rt.Id != originalToken.Id).ToList();

    Assert.NotNull(reloadedOriginal);
    Assert.NotNull(reloadedOriginal!.RevokedAt);
    Assert.Equal("Rotated", reloadedOriginal.ReasonRevoked);
    Assert.NotNull(reloadedOriginal.ReplacedByTokenId);

    var newToken = Assert.Single(newRows);
    Assert.Equal(reloadedOriginal.ReplacedByTokenId, newToken.Id);
    Assert.Equal(originalToken.FamilyId, newToken.FamilyId);
    Assert.Null(newToken.RevokedAt);
  }

  [Fact]
  public async Task ReplayOfAlreadyRotatedToken_RevokesRemainingActiveFamilyMember()
  {
    await using var context = _fixture.CreateContext();
    var user = await CreateUserAsync(context);
    var service = CreateService(context);

    var (_, rawA) = await service.IssueAsync(user.Id, null, CancellationToken.None);
    await context.SaveChangesAsync();

    var firstRotation = await service.ValidateAndRotateAsync(rawA, null, CancellationToken.None);
    Assert.True(firstRotation.IsValid);

    // Replay: present the already-rotated original token again.
    var replay = await service.ValidateAndRotateAsync(rawA, null, CancellationToken.None);
    Assert.False(replay.IsValid);

    // The legitimate child token (still active a moment ago) must now be revoked too.
    await using var verifyContext = _fixture.CreateContext();
    var stillActive = verifyContext.RefreshTokens.Any(rt => rt.TokenHash == TokenHasher.Hash(firstRotation.RawToken!) && rt.RevokedAt == null);
    Assert.False(stillActive);
  }

  [Fact]
  public async Task ExpiredToken_Rejected()
  {
    await using var context = _fixture.CreateContext();
    var user = await CreateUserAsync(context);

    var expiredRaw = RefreshTokenGenerator.Generate();
    context.RefreshTokens.Add(new RefreshToken(Guid.NewGuid())
    {
      UserId = user.Id,
      FamilyId = Guid.NewGuid(),
      TokenHash = TokenHasher.Hash(expiredRaw),
      ExpiresAt = DateTime.UtcNow.AddDays(-1),
      AbsoluteExpiresAt = DateTime.UtcNow.AddDays(10),
    });
    await context.SaveChangesAsync();

    var result = await CreateService(context).ValidateAndRotateAsync(expiredRaw, null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task AbsoluteFamilyExpiration_Enforced_EvenWithFreshIdleExpiry()
  {
    await using var context = _fixture.CreateContext();
    var user = await CreateUserAsync(context);

    var raw = RefreshTokenGenerator.Generate();
    context.RefreshTokens.Add(new RefreshToken(Guid.NewGuid())
    {
      UserId = user.Id,
      FamilyId = Guid.NewGuid(),
      TokenHash = TokenHasher.Hash(raw),
      ExpiresAt = DateTime.UtcNow.AddDays(5),
      AbsoluteExpiresAt = DateTime.UtcNow.AddMinutes(-1),
    });
    await context.SaveChangesAsync();

    var result = await CreateService(context).ValidateAndRotateAsync(raw, null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task UnknownToken_Rejected()
  {
    await using var context = _fixture.CreateContext();
    var result = await CreateService(context).ValidateAndRotateAsync(RefreshTokenGenerator.Generate(), null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Theory]
  [InlineData("")]
  [InlineData("not-a-real-token")]
  [InlineData("   ")]
  public async Task MalformedToken_Rejected(string malformed)
  {
    await using var context = _fixture.CreateContext();
    var result = await CreateService(context).ValidateAndRotateAsync(malformed, null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task InactiveUser_Rejected()
  {
    await using var context = _fixture.CreateContext();
    var user = await CreateUserAsync(context, isActive: false);
    var service = CreateService(context);

    var (_, raw) = await service.IssueAsync(user.Id, null, CancellationToken.None);
    await context.SaveChangesAsync();

    var result = await service.ValidateAndRotateAsync(raw, null, CancellationToken.None);

    Assert.False(result.IsValid);
  }

  [Fact]
  public async Task ConcurrentRefresh_SameToken_ExactlyOneRotationSucceeds()
  {
    await using var setupContext = _fixture.CreateContext();
    var user = await CreateUserAsync(setupContext);
    var setupService = CreateService(setupContext);

    var (originalToken, raw) = await setupService.IssueAsync(user.Id, null, CancellationToken.None);
    await setupContext.SaveChangesAsync();

    // Two independent DbContexts/connections, exactly as two concurrent HTTP requests would each
    // get their own scoped DbContext — both race to rotate the very same raw token.
    await using var contextA = _fixture.CreateContext();
    await using var contextB = _fixture.CreateContext();
    var serviceA = CreateService(contextA);
    var serviceB = CreateService(contextB);

    var results = await Task.WhenAll(
      serviceA.ValidateAndRotateAsync(raw, "1.1.1.1", CancellationToken.None),
      serviceB.ValidateAndRotateAsync(raw, "2.2.2.2", CancellationToken.None));

    // Invariant 1: the two concurrent attempts using the same raw token cannot both succeed.
    var successCount = results.Count(r => r.IsValid);
    Assert.Equal(1, successCount);

    await using var verifyContext = _fixture.CreateContext();
    var familyRows = verifyContext.RefreshTokens.Where(rt => rt.FamilyId == originalToken.FamilyId).ToList();
    var childRows = familyRows.Where(rt => rt.Id != originalToken.Id).ToList();

    // Invariant 2: exactly one child row was ever committed — the loser must claim the parent
    // atomically BEFORE creating anything, so it never gets far enough to insert a second row.
    var childRow = Assert.Single(childRows);

    // Invariant 3: no orphan — the child that exists is properly linked from the parent, not a
    // stray row unconnected to the lineage.
    var reloadedParent = familyRows.Single(rt => rt.Id == originalToken.Id);
    Assert.Equal(childRow.Id, reloadedParent.ReplacedByTokenId);
    Assert.NotNull(reloadedParent.RevokedAt);
    Assert.Equal("Rotated", reloadedParent.ReasonRevoked);

    // Invariant 4 (deterministic, not just "usually"): under SQL Server's row-level locking, the
    // loser's claim attempt necessarily blocks until the winner's transaction commits, so the
    // loser always observes the winner's fully-committed child as part of its own family-wide
    // sweep. The net effect of any concurrent collision is therefore always a fully dead family —
    // including the winner's own new token — never a silently-surviving usable leaf.
    Assert.Equal("ReuseDetected", childRow.ReasonRevoked);
    Assert.NotNull(childRow.RevokedAt);

    // Invariant 5: no duplicate (or any) usable leaf token remains — every row in the family,
    // parent and child alike, ends up revoked.
    Assert.All(familyRows, rt => Assert.NotNull(rt.RevokedAt));
    Assert.DoesNotContain(familyRows, rt => rt.RevokedAt == null);
  }
}
