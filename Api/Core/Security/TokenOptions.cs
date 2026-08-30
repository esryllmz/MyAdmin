namespace Api.Core.Security;

public class TokenOptions
{
  public string Audience { get; set; } = default!;
  public string Issuer { get; set; } = default!;
  public int AccessTokenExpiration { get; set; }
  public int RefreshTokenExpiration { get; set; }

  /// <summary>
  /// Hard cap on a refresh-token family's lifetime, in days, measured from the login that
  /// started it — independent of how many times it's rotated. Once reached, the family is
  /// exhausted and the user must fully re-authenticate, even if every individual rotation was
  /// legitimate. Must be &gt;= <see cref="RefreshTokenExpiration"/> (validated at startup).
  /// </summary>
  public int RefreshTokenAbsoluteLifetimeDays { get; set; }

  public string SecurityKey { get; set; } = default!;
}
