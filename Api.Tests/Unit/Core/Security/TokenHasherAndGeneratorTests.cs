using Api.Core.Security;
using System.Text.RegularExpressions;

namespace Api.Tests.Unit.Core.Security;

public partial class TokenHasherAndGeneratorTests
{
  [GeneratedRegex("^[0-9a-f]{64}$")]
  private static partial Regex LowercaseHex64Regex();

  [Fact]
  public void Hash_IsDeterministic_SameInputSameOutput()
  {
    var raw = RefreshTokenGenerator.Generate();

    Assert.Equal(TokenHasher.Hash(raw), TokenHasher.Hash(raw));
  }

  [Fact]
  public void Hash_DifferentInputs_ProduceDifferentHashes()
  {
    var a = RefreshTokenGenerator.Generate();
    var b = RefreshTokenGenerator.Generate();

    Assert.NotEqual(TokenHasher.Hash(a), TokenHasher.Hash(b));
  }

  [Fact]
  public void Hash_IsLowercase64CharacterHex()
  {
    var hash = TokenHasher.Hash("any-raw-token-value");

    Assert.Matches(LowercaseHex64Regex(), hash);
  }

  [Fact]
  public void Generate_ProducesUniqueValues()
  {
    var tokens = Enumerable.Range(0, 1000).Select(_ => RefreshTokenGenerator.Generate()).ToHashSet();

    Assert.Equal(1000, tokens.Count);
  }

  [Fact]
  public void Generate_IsUrlSafe_NoPaddingOrUnsafeCharacters()
  {
    var raw = RefreshTokenGenerator.Generate();

    Assert.DoesNotContain('+', raw);
    Assert.DoesNotContain('/', raw);
    Assert.DoesNotContain('=', raw);
  }
}
