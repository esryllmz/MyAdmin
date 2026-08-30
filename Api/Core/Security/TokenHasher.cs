using System.Security.Cryptography;
using System.Text;

namespace Api.Core.Security;

/// <summary>
/// Fast, deterministic hashing for high-entropy bearer tokens (refresh tokens) — NOT for
/// passwords. Refresh tokens are already 256 bits of CSPRNG output, so an adaptive/slow KDF adds
/// only latency and DoS surface here; a plain SHA-256 is the correct tool because the database
/// must still support an exact-match lookup by hash.
/// </summary>
public static class TokenHasher
{
  public static string Hash(string rawToken)
  {
    var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));

    return Convert.ToHexString(bytes).ToLowerInvariant();
  }
}
