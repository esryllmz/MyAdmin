using Api.Core.Controllers;
using Api.Core.Exceptions;
using Api.Core.Responses;
using Api.Features.Users;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Authentication;

[Route("api/[controller]")]
[ApiController]
public class AuthenticationController(
  IAuthenticationService _authService,
  IWebHostEnvironment _environment) : CustomBaseController
{
  private const string RefreshCookieName = "myadmin_rt";
  private const string CookiePath = "/api/authentication";

  [HttpPost("register")]
  public async Task<IActionResult> Register(
    [FromBody] RegisterUserRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _authService.RegisterAsync(request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost("login")]
  public async Task<IActionResult> Login(
    [FromBody] LoginRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _authService.LoginAsync(request, GetClientIp(), cancellationToken);

    SetRefreshTokenCookie(result.Data!.RawRefreshToken, result.Data.RefreshTokenExpiresAt);

    return CreateActionResult(ToPublicReturnModel(result));
  }

  [HttpPost("refresh-token")]
  public async Task<IActionResult> RefreshToken(CancellationToken cancellationToken)
  {
    var rawToken = Request.Cookies[RefreshCookieName];

    // AuthenticationService throws (never returns Success=false) for every invalid-session case,
    // so the client's stale/rejected cookie is only ever cleaned up here, on the way out.
    try
    {
      var result = await _authService.RefreshTokenAsync(rawToken, GetClientIp(), cancellationToken);

      SetRefreshTokenCookie(result.Data!.RawRefreshToken, result.Data.RefreshTokenExpiresAt);

      return CreateActionResult(ToPublicReturnModel(result));
    }
    catch (AuthorizationException)
    {
      DeleteRefreshTokenCookie();

      throw;
    }
  }

  [HttpPost("logout")]
  public async Task<IActionResult> Logout(CancellationToken cancellationToken)
  {
    var rawToken = Request.Cookies[RefreshCookieName];

    await _authService.LogoutAsync(rawToken, GetClientIp(), cancellationToken);

    DeleteRefreshTokenCookie();

    return NoContent();
  }

  private static ReturnModel<TokenResponseDto> ToPublicReturnModel(ReturnModel<AuthenticationResult> result)
  {
    return new ReturnModel<TokenResponseDto>
    {
      Success = result.Success,
      Message = result.Message,
      StatusCode = result.StatusCode,
      Errors = result.Errors,
      Data = result.Data?.Response
    };
  }

  private void SetRefreshTokenCookie(string rawToken, DateTime expiresAtUtc)
  {
    Response.Cookies.Append(RefreshCookieName, rawToken, new CookieOptions
    {
      HttpOnly = true,
      Secure = !_environment.IsDevelopment(),
      SameSite = SameSiteMode.Strict,
      Path = CookiePath,
      Expires = expiresAtUtc,
    });
  }

  private void DeleteRefreshTokenCookie()
  {
    Response.Cookies.Delete(RefreshCookieName, new CookieOptions
    {
      HttpOnly = true,
      Secure = !_environment.IsDevelopment(),
      SameSite = SameSiteMode.Strict,
      Path = CookiePath,
    });
  }

  private string? GetClientIp()
  {
    return HttpContext.Connection.RemoteIpAddress?.ToString();
  }
}
