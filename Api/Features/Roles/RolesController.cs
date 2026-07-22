using Api.Core.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Roles;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class RolesController(IRoleService _roleService) : CustomBaseController
{
  [HttpGet]
  public async Task<IActionResult> GetAll(
    CancellationToken cancellationToken)
  {
    var result = await _roleService.GetAllAsync(cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _roleService.GetByIdAsync(id, cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("get-by-name")]
  public async Task<IActionResult> GetByName(
    [FromQuery] string name,
    CancellationToken cancellationToken)
  {
    var result = await _roleService.GetAsync(
      predicate: r => r.Name.ToLower() == name.ToLower(),
      cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Add(
    [FromBody] CreateRoleRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _roleService.AddAsync(request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPut("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Update(
    [FromRoute] Guid id,
    [FromBody] UpdateRoleRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _roleService.UpdateAsync(id, request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _roleService.RemoveAsync(id, cancellationToken);

    return CreateActionResult(result);
  }
}
