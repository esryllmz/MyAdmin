using Api.Core.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Permissions;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class PermissionsController(IPermissionService _permissionService) : CustomBaseController
{
  [HttpGet]
  public async Task<IActionResult> GetAll(
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.GetAllAsync(cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.GetByIdAsync(id, cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("get-by-name")]
  public async Task<IActionResult> GetByName(
    [FromQuery] string name,
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.GetAsync(
      predicate: p => p.Name.ToLower() == name.ToLower(),
      cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Add(
    [FromBody] CreatePermissionRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.AddAsync(request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPut("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Update(
    [FromRoute] Guid id,
    [FromBody] UpdatePermissionRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.UpdateAsync(id, request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _permissionService.RemoveAsync(id, cancellationToken);

    return CreateActionResult(result);
  }
}
