using Api.Core.Responses;
using Api.Features.Users;

namespace Api.Features.Authentication;

public interface IAuthenticationService
{
  Task<ReturnModel<AuthenticationResult>> LoginAsync(
    LoginRequest request,
    string? ipAddress,
    CancellationToken cancellationToken);

  Task<ReturnModel<CreatedUserResponseDto>> RegisterAsync(
    RegisterUserRequest request,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<AuthenticationResult>> RefreshTokenAsync(
    string? refreshToken,
    string? ipAddress,
    CancellationToken cancellationToken);

  /// <summary>Always succeeds (idempotent) — see RefreshTokenService.RevokeAsync.</summary>
  Task LogoutAsync(
    string? refreshToken,
    string? ipAddress,
    CancellationToken cancellationToken);
}
