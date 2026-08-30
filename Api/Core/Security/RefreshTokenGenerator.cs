using System.Buffers.Text;
using System.Security.Cryptography;

namespace Api.Core.Security;

/// <summary>
/// Generates the raw, bearer-usable refresh token value. This value must only ever exist
/// transiently (in memory while handling a request, and in the HttpOnly cookie sent to the
/// client) — it is never logged and never persisted; only <see cref="TokenHasher"/>'s digest of
/// it is stored.
/// </summary>
public static class RefreshTokenGenerator
{
  private const int TokenByteLength = 32;

  public static string Generate()
  {
    var bytes = RandomNumberGenerator.GetBytes(TokenByteLength);

    return Base64Url.EncodeToString(bytes);
  }
}
