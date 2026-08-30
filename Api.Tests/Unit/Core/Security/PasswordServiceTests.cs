using Api.Core.Security;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace Api.Tests.Unit.Core.Security;

public class PasswordServiceTests
{
  private static PasswordService<User> CreateService(int iterationCount = 210_000)
  {
    var hasher = new PasswordHasher<User>(Options.Create(new PasswordHasherOptions { IterationCount = iterationCount }));
    return new PasswordService<User>(hasher);
  }

  private static User CreateUser() => new()
  {
    Username = "dummy",
    Email = "dummy@example.com",
    PasswordHash = string.Empty,
  };

  [Fact]
  public void HashPassword_ThenVerifyModern_RoundTrips_Succeeds()
  {
    var service = CreateService();
    var user = CreateUser();

    var hash = service.HashPassword(user, "Correct-Horse-1!");
    var outcome = service.VerifyModern(user, hash, "Correct-Horse-1!");

    Assert.Equal(PasswordVerificationOutcome.Success, outcome);
  }

  [Fact]
  public void VerifyModern_WrongPassword_Fails()
  {
    var service = CreateService();
    var user = CreateUser();

    var hash = service.HashPassword(user, "Correct-Horse-1!");
    var outcome = service.VerifyModern(user, hash, "totally-wrong");

    Assert.Equal(PasswordVerificationOutcome.Failed, outcome);
  }

  [Fact]
  public void VerifyModern_HashCreatedWithLowerIterationCount_ReturnsSuccessRehashNeeded()
  {
    var user = CreateUser();
    var oldHash = CreateService(iterationCount: 1_000).HashPassword(user, "Correct-Horse-1!");

    var currentService = CreateService(iterationCount: 210_000);
    var outcome = currentService.VerifyModern(user, oldHash, "Correct-Horse-1!");

    Assert.Equal(PasswordVerificationOutcome.SuccessRehashNeeded, outcome);
  }

  [Fact]
  public void HashPassword_NeverProducesTheSameOutputTwice_BecauseOfRandomSalt()
  {
    var service = CreateService();
    var user = CreateUser();

    var hash1 = service.HashPassword(user, "Correct-Horse-1!");
    var hash2 = service.HashPassword(user, "Correct-Horse-1!");

    Assert.NotEqual(hash1, hash2);
  }
}
