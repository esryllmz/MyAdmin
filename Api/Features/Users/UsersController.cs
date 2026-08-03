using Api.Core.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Users;

[Route("api/[controller]")]
[ApiController]
public class UsersController(IUserService _userService) : CustomBaseController
{
  [HttpGet]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetAll(
    CancellationToken cancellationToken)
  {
    var result = await _userService.GetAllAsync(cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  [Authorize]
  public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _userService.GetByIdAsync(id, cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPut("profile")]
  [Authorize]
  public async Task<IActionResult> Update(
    [FromForm] UpdateUserRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.UpdateAsync(request, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Admin bir başka kullanıcının profil bilgilerini düzenler. "profile" ucundan farklı olarak
  /// token'daki kullanıcı yerine route'taki {id} hedeflenir — aksi halde bir Admin başka
  /// kullanıcıyı düzenlerken yanlışlıkla kendi hesabını güncellemiş olurdu.
  /// </summary>
  [HttpPut("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> UpdateByAdmin(
    Guid id,
    [FromForm] UpdateUserRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.UpdateAsync(request, id, cancellationToken);

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

  [HttpPatch("{id:guid}/status")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> UpdateStatus(
    Guid id,
    [FromBody] UpdateUserStatusRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _userService.UpdateStatusAsync(id, request.IsActive, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize]
  public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
  {
    var currentUserId = GetUserId();
    var roles = GetUserRoles();

    var primaryRole = roles.Contains("Admin") ? "Admin" : (roles.FirstOrDefault() ?? string.Empty);

    var result = await _userService.RemoveAsync(id, currentUserId, primaryRole, cancellationToken);

    return CreateActionResult(result);
  }
}
