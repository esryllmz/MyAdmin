using System.Security.Cryptography;
using System.Text;

namespace Api.Core.Security;

public static class HashingHelper
{
  public static void CreatePasswordHash(string password, out string passwordHash, out string passwordKey)
  {
    using var hmac = new HMACSHA512();

    passwordKey = Convert.ToBase64String(hmac.Key);
    passwordHash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
  }

  public static bool VerifyPasswordHash(string password, string passwordHash, string passwordKey)
  {
    if (string.IsNullOrWhiteSpace(password) ||
        string.IsNullOrWhiteSpace(passwordHash) ||
        string.IsNullOrWhiteSpace(passwordKey))
    {
      return false;
    }

    byte[] key;

    try
    {
      key = Convert.FromBase64String(passwordKey);
    }
    catch (FormatException)
    {
      return false;
    }

    using var hmac = new HMACSHA512(key);

    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

    return Convert.ToBase64String(computedHash) == passwordHash;
  }
}
