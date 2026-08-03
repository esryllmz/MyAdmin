using Api.Core.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Activities;

[Route("api/[controller]")]
[ApiController]
public class ActivitiesController(IActivityService _activityService) : CustomBaseController
{
  [HttpGet]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
  {
    var result = await _activityService.GetAllAsync(cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Yalnızca çağıran kullanıcının kendi aktivitelerini döner — token'daki kullanıcı ID'si
  /// kullanılır, sorgu parametresiyle başka bir kullanıcının verisi seçilemez. Viewer/Editor
  /// dahil her authenticated rol erişebilir; "My Activity" ekranlarının tek veri kaynağıdır.
  /// </summary>
  [HttpGet("me")]
  [Authorize]
  public async Task<IActionResult> GetMyActivities(CancellationToken cancellationToken)
  {
    var currentUserId = GetUserId();

    var result = await _activityService.GetAllAsync(
      filter: a => a.UserId == currentUserId,
      cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _activityService.GetByIdAsync(id, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("get-by-entity/{entityName}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> GetByEntity(
    string entityName,
    CancellationToken cancellationToken)
  {
    var result = await _activityService.GetAllAsync(
      filter: a => a.EntityName.ToLower() == entityName.ToLower(),
      cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Add(
    [FromBody] CreateActivityRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _activityService.AddAsync(request, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Delete(
    Guid id,
    CancellationToken cancellationToken)
  {
    var result = await _activityService.RemoveAsync(id, cancellationToken);

    return CreateActionResult(result);
  }
}