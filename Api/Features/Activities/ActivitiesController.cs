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

  /// <summary>
  /// Editor's "Operations Activity"/"Reports > User Activity"/"Reports > Team Operations" data
  /// source — Action is restricted to the OperationalActivityActions whitelist (Viewer account
  /// lifecycle + Team/membership events only), so role/permission/API-key/security-policy rows
  /// never reach an Editor session no matter what filters are passed.
  /// </summary>
  [HttpGet("operations")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> GetOperationalActivities(
    [FromQuery] string? entityName,
    [FromQuery] DateTime? from,
    [FromQuery] DateTime? to,
    [FromQuery] bool? isSuccess,
    [FromQuery] Guid? userId,
    CancellationToken cancellationToken)
  {
    var allowedActions = OperationalActivityActions.All;

    var result = await _activityService.GetAllAsync(
      filter: a =>
        allowedActions.Contains(a.Action) &&
        (string.IsNullOrEmpty(entityName) || a.EntityName == entityName) &&
        (from == null || a.CreatedDate >= from) &&
        (to == null || a.CreatedDate <= to) &&
        (isSuccess == null || a.IsSuccess == isSuccess) &&
        (userId == null || a.UserId == userId),
      orderBy: q => q.OrderByDescending(a => a.CreatedDate),
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