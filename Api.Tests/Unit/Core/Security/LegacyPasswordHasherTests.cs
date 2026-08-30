using Api.Core.Security;
using System.Security.Cryptography;
using System.Text;

namespace Api.Tests.Unit.Core.Security;

public class LegacyPasswordHasherTests
{
  /// <summary>
  /// Reproduces exactly what the removed HashingHelper.CreatePasswordHash used to do, so these
  /// tests can simulate "a row already on the legacy scheme" without production code ever being
  /// able to create one again.
  /// </summary>
  private static (string Hash, string Key) CreateLegacyHash(string password)
  {
    using var hmac = new HMACSHA512();
    var key = Convert.ToBase64String(hmac.Key);
    var hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
    return (hash, key);
  }

  [Fact]
  public void VerifyPasswordHash_CorrectPassword_ReturnsTrue()
  {
    var (hash, key) = CreateLegacyHash("Correct-Horse-1!");

    Assert.True(LegacyPasswordHasher.VerifyPasswordHash("Correct-Horse-1!", hash, key));
  }

  [Fact]
  public void VerifyPasswordHash_WrongPassword_ReturnsFalse()
  {
    var (hash, key) = CreateLegacyHash("Correct-Horse-1!");

    Assert.False(LegacyPasswordHasher.VerifyPasswordHash("wrong-password", hash, key));
  }

  [Fact]
  public void VerifyPasswordHash_MalformedKey_ReturnsFalseInsteadOfThrowing()
  {
    var (hash, _) = CreateLegacyHash("Correct-Horse-1!");

    Assert.False(LegacyPasswordHasher.VerifyPasswordHash("Correct-Horse-1!", hash, "not-base64!!"));
  }

  [Theory]
  [InlineData(null, "key")]
  [InlineData("hash", null)]
  [InlineData("", "key")]
  [InlineData("hash", "")]
  public void VerifyPasswordHash_MissingHashOrKey_ReturnsFalse(string? hash, string? key)
  {
    Assert.False(LegacyPasswordHasher.VerifyPasswordHash("Correct-Horse-1!", hash!, key!));
  }
}
