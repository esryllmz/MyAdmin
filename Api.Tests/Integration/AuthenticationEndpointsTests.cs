using Api.Tests.Integration.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Api.Tests.Integration;

[Collection("Integration")]
public class AuthenticationEndpointsTests : IDisposable
{
  private const string CookieName = "myadmin_rt";

  private readonly AuthenticationApiFactory _factory;
  private readonly HttpClient _client;

  public AuthenticationEndpointsTests(SqlServerFixture fixture)
  {
    _factory = new AuthenticationApiFactory(fixture.ConnectionString);

    // HandleCookies=false is deliberate: with it on, HttpClient tracks Set-Cookie responses in
    // its own jar and silently merges/overrides whatever we set on Cookie ourselves, making it
    // impossible to deterministically test "send this specific (possibly stale) cookie value."
    // Every cookie sent in these tests is therefore explicit, via a manually-added header.
    _client = _factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
  }

  public void Dispose()
  {
    _client.Dispose();
    _factory.Dispose();
  }

  private static string? ExtractCookieValue(HttpResponseMessage response)
  {
    if (!response.Headers.TryGetValues("Set-Cookie", out var setCookieHeaders))
    {
      return null;
    }

    foreach (var header in setCookieHeaders)
    {
      if (header.StartsWith($"{CookieName}=", StringComparison.Ordinal))
      {
        var afterName = header[(CookieName.Length + 1)..];
        return afterName.Split(';')[0];
      }
    }

    return null;
  }

  private static bool CookieIsBeingCleared(HttpResponseMessage response)
  {
    if (!response.Headers.TryGetValues("Set-Cookie", out var setCookieHeaders))
    {
      return false;
    }

    return setCookieHeaders.Any(h =>
      h.StartsWith($"{CookieName}=", StringComparison.Ordinal) &&
      (h.Contains("expires=Thu, 01 Jan 1970", StringComparison.OrdinalIgnoreCase) || h.Contains($"{CookieName}=;", StringComparison.Ordinal)));
  }

  private async Task<(Guid Id, string Email, string Password)> RegisterUserAsync()
  {
    var email = $"{Guid.NewGuid():N}@example.com";
    const string password = "Correct-Horse-1!";

    var response = await _client.PostAsJsonAsync("/api/authentication/register", new
    {
      username = $"user{Guid.NewGuid():N}"[..15],
      email,
      password,
      profileImageUrl = (string?)null,
      bio = (string?)null,
    });

    response.EnsureSuccessStatusCode();

    var body = await response.Content.ReadAsStringAsync();
    using var json = JsonDocument.Parse(body);
    var id = json.RootElement.GetProperty("data").GetProperty("id").GetGuid();

    return (id, email, password);
  }

  /// <summary>
  /// Logs in as the Development-only seeded admin (see DevelopmentDataSeeder) and returns a
  /// bearer access token — used only to drive the real /api/users/{id}/status endpoint as an
  /// authorized caller, exactly as a real admin session would.
  /// </summary>
  private async Task<string> LoginAsSeededAdminAsync()
  {
    var response = await _client.PostAsJsonAsync("/api/authentication/login", new
    {
      email = "admin@myadmin.com",
      password = "Admin123!",
    });

    response.EnsureSuccessStatusCode();

    var body = await response.Content.ReadAsStringAsync();
    using var json = JsonDocument.Parse(body);

    return json.RootElement.GetProperty("data").GetProperty("accessToken").GetString()!;
  }

  [Fact]
  public async Task Login_SetsHttpOnlyRefreshCookie_AndResponseBodyContainsNoRefreshToken()
  {
    var (_, email, password) = await RegisterUserAsync();

    var response = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var body = await response.Content.ReadAsStringAsync();

    response.EnsureSuccessStatusCode();

    Assert.True(response.Headers.TryGetValues("Set-Cookie", out var cookies));
    var refreshCookieHeader = cookies!.Single(c => c.StartsWith($"{CookieName}=", StringComparison.Ordinal));
    Assert.Contains("httponly", refreshCookieHeader, StringComparison.OrdinalIgnoreCase);

    using var json = JsonDocument.Parse(body);
    Assert.False(
      json.RootElement.GetProperty("data").TryGetProperty("refreshToken", out _),
      "TokenResponseDto must not expose the raw refresh token in the response body.");
  }

  [Fact]
  public async Task Refresh_RotatesCookieValue()
  {
    var (_, email, password) = await RegisterUserAsync();

    var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var originalCookie = ExtractCookieValue(loginResponse);
    Assert.NotNull(originalCookie);

    var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/refresh-token");
    refreshRequest.Headers.Add("Cookie", $"{CookieName}={originalCookie}");
    var refreshResponse = await _client.SendAsync(refreshRequest);

    refreshResponse.EnsureSuccessStatusCode();
    var rotatedCookie = ExtractCookieValue(refreshResponse);

    Assert.NotNull(rotatedCookie);
    Assert.NotEqual(originalCookie, rotatedCookie);
  }

  [Fact]
  public async Task Refresh_ReplayingThePreviousCookie_ReturnsUnauthorized()
  {
    var (_, email, password) = await RegisterUserAsync();

    var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var originalCookie = ExtractCookieValue(loginResponse);

    var firstRefresh = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/refresh-token");
    firstRefresh.Headers.Add("Cookie", $"{CookieName}={originalCookie}");
    (await _client.SendAsync(firstRefresh)).EnsureSuccessStatusCode();

    // Replay the now-rotated-away original cookie.
    var replay = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/refresh-token");
    replay.Headers.Add("Cookie", $"{CookieName}={originalCookie}");
    var replayResponse = await _client.SendAsync(replay);

    Assert.Equal(HttpStatusCode.Unauthorized, replayResponse.StatusCode);
  }

  [Fact]
  public async Task Logout_Returns204_AndClearsCookie_AndSubsequentRefreshFails()
  {
    var (_, email, password) = await RegisterUserAsync();

    var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var cookie = ExtractCookieValue(loginResponse);

    var logoutRequest = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/logout");
    logoutRequest.Headers.Add("Cookie", $"{CookieName}={cookie}");
    var logoutResponse = await _client.SendAsync(logoutRequest);

    Assert.Equal(HttpStatusCode.NoContent, logoutResponse.StatusCode);
    Assert.True(CookieIsBeingCleared(logoutResponse));

    var refreshAfterLogout = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/refresh-token");
    refreshAfterLogout.Headers.Add("Cookie", $"{CookieName}={cookie}");
    var refreshResponse = await _client.SendAsync(refreshAfterLogout);

    Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
  }

  [Fact]
  public async Task Logout_WithNoCookieAtAll_StillReturns204()
  {
    var response = await _client.PostAsync("/api/authentication/logout", content: null);

    Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
  }

  [Fact]
  public async Task Logout_CalledTwiceWithSameCookie_IsIdempotent()
  {
    var (_, email, password) = await RegisterUserAsync();
    var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var cookie = ExtractCookieValue(loginResponse);

    var first = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/logout");
    first.Headers.Add("Cookie", $"{CookieName}={cookie}");
    var firstResponse = await _client.SendAsync(first);

    var second = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/logout");
    second.Headers.Add("Cookie", $"{CookieName}={cookie}");
    var secondResponse = await _client.SendAsync(second);

    Assert.Equal(HttpStatusCode.NoContent, firstResponse.StatusCode);
    Assert.Equal(HttpStatusCode.NoContent, secondResponse.StatusCode);
  }

  [Fact]
  public async Task UserDeactivation_RevokesActiveRefreshSession_SoSubsequentRefreshFails()
  {
    // Active user with a valid refresh session...
    var (targetUserId, email, password) = await RegisterUserAsync();
    var loginResponse = await _client.PostAsJsonAsync("/api/authentication/login", new { email, password });
    var cookie = ExtractCookieValue(loginResponse);
    Assert.NotNull(cookie);

    // ...becomes inactive, via the real PATCH /api/users/{id}/status endpoint, driven by a real
    // authorized admin session — not a direct DB/service-layer shortcut.
    var adminAccessToken = await LoginAsSeededAdminAsync();
    var deactivateRequest = new HttpRequestMessage(HttpMethod.Patch, $"/api/users/{targetUserId}/status")
    {
      Content = JsonContent.Create(new { isActive = false }),
    };
    deactivateRequest.Headers.Add("Authorization", $"Bearer {adminAccessToken}");
    var deactivateResponse = await _client.SendAsync(deactivateRequest);
    deactivateResponse.EnsureSuccessStatusCode();

    // ...so the refresh token issued before deactivation must now fail.
    var refreshRequest = new HttpRequestMessage(HttpMethod.Post, "/api/authentication/refresh-token");
    refreshRequest.Headers.Add("Cookie", $"{CookieName}={cookie}");
    var refreshResponse = await _client.SendAsync(refreshRequest);

    Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
  }
}
