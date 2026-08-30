using Api.Features.Users;

namespace Api.Features.Authentication;

public record TokenResponseDto(
  string AccessToken,
  DateTime Expiration,
  UserResponseDto User);

public sealed record LoginRequest(string Email, string Password);

/// <summary>
/// Internal service→controller handoff only — never serialized to a client. The controller
/// extracts RawRefreshToken/RefreshTokenExpiresAt to set the HttpOnly cookie and forwards only
/// Response (a TokenResponseDto) in the public API response body.
/// </summary>
public sealed record AuthenticationResult(
  TokenResponseDto Response,
  string RawRefreshToken,
  DateTime RefreshTokenExpiresAt);
