using Api.Core.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Users;

[Route("api/[controller]")]
[ApiController]
public class UsersController(IUserService _userService) : CustomBaseController
{
  [NonAction]
  private string GetPrimaryRole()
  {
    var roles = GetUserRoles();
    return roles.Contains("Admin") ? "Admin" : roles.Contains("Editor") ? "Editor" : (roles.FirstOrDefault() ?? string.Empty);
  }

  [HttpGet]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetAll(
    CancellationToken cancellationToken)
  {
    var result = await _userService.GetAllAsync(cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// The Editor workspace's user list — always server-scoped to Viewer-role accounts only (see
  /// UserService.GetManageableViewersAsync), so an Editor can never enumerate Admin/Editor rows
  /// by calling this endpoint instead of the Admin-only GET above.
  /// </summary>
  [HttpGet("manageable")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> GetManageable(
    [FromQuery] string? search,
    [FromQuery] bool? isActive,
    [FromQuery] Guid? teamId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? sort = null,
    CancellationToken cancellationToken = default)
  {
    var result = await _userService.GetManageableViewersAsync(
      new ManageableUsersQuery(search, isActive, teamId, page, pageSize, sort), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  [Authorize]
  public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _userService.GetByIdAsync(id, GetUserId(), GetPrimaryRole(), cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Editor/Admin-only Viewer account creation — always assigns the Viewer application role
  /// server-side (see UserService.CreateViewerAccountAsync), so this can never be used to mint
  /// an Editor or Admin account regardless of what the client sends.
  /// </summary>
  [HttpPost("viewers")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> CreateViewerAccount(
    [FromBody] CreateViewerAccountRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.CreateViewerAccountAsync(request, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPut("profile")]
  [Authorize]
  public async Task<IActionResult> Update(
    [FromForm] UpdateUserRequest request,
    CancellationToken cancellationToken)
  {
    var userId = GetUserId();
    var result = await _userService.UpdateAsync(request, userId, userId, GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Admin/Editor editing a *different* user's profile — targets the route's {id}, not the
  /// caller. Editor is restricted server-side to Viewer targets only (see
  /// UserBusinessRules.EditorMayOnlyTargetViewerUsers) — the Admin-only restriction that used to
  /// live here would have made the Editor "Edit Viewer profile" feature silently 403.
  /// </summary>
  [HttpPut("{id:guid}")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> UpdateByAdmin(
    Guid id,
    [FromForm] UpdateUserRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.UpdateAsync(request, id, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPatch("change-password")]
  [Authorize]
  public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.ChangePasswordAsync(request, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Editor is allowed here too, but only against Viewer targets (see
  /// UserBusinessRules.EditorMayOnlyTargetViewerUsers) — an Editor deactivating an Admin or
  /// another Editor account is exactly the privilege-escalation/denial-of-service path this
  /// guards against.
  /// </summary>
  [HttpPatch("{id:guid}/status")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> UpdateStatus(
    Guid id,
    [FromBody] UpdateUserStatusRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.UpdateStatusAsync(id, request.IsActive, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize]
  public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
  {
    var currentUserId = GetUserId();
    var primaryRole = GetPrimaryRole();

    var result = await _userService.RemoveAsync(id, currentUserId, primaryRole, cancellationToken);

    return CreateActionResult(result);
  }
}
