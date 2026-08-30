using System.Security.Cryptography;
using System.Text;

namespace Api.Core.Security;

/// <summary>
/// Verifies passwords hashed with the pre-P0 HMACSHA512 scheme. Verification-only, on purpose:
/// no code path may create a new hash with this scheme. A successful legacy verification is the
/// caller's signal to rehash the password with <see cref="IPasswordService{TUser}"/> and persist
/// that instead — this class never persists anything itself.
/// </summary>
public static class LegacyPasswordHasher
{
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
