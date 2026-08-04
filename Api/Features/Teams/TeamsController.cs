using Api.Core.Controllers;
using Api.Features.Activities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Features.Teams;

/// <summary>
/// Team CRUD and membership management. Admin has full control; Editor may create/edit/activate
/// teams and manage Viewer-only memberships (see TeamBusinessRules) — Editor can never delete a
/// team, assign the Owner role, or touch an Admin/Editor membership. Every mutating action is
/// [Authorize]'d here AND re-checked in TeamBusinessRules, since a frontend-only restriction is
/// not a security control.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class TeamsController(ITeamService _teamService, IActivityService _activityService) : CustomBaseController
{
  [NonAction]
  private string GetPrimaryRole()
  {
    var roles = GetUserRoles();
    return roles.Contains("Admin") ? "Admin" : roles.Contains("Editor") ? "Editor" : (roles.FirstOrDefault() ?? string.Empty);
  }

  [HttpGet]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> GetAll(
    [FromQuery] string? search,
    [FromQuery] bool? isActive,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20,
    [FromQuery] string? sort = null,
    CancellationToken cancellationToken = default)
  {
    var result = await _teamService.GetAllAsync(new TeamListQuery(search, isActive, page, pageSize, sort), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}")]
  [Authorize]
  public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
  {
    var result = await _teamService.GetByIdAsync(id, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// "My Teams" — always scoped to the caller's own active memberships via the JWT, and returns
  /// the privacy-safe MyTeamResponseDto (no created-by ID, no owner details). This is the only
  /// Teams surface a Viewer's frontend uses.
  /// </summary>
  [HttpGet("mine")]
  [Authorize]
  public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
  {
    var result = await _teamService.GetMyTeamsAsync(GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("mine/{id:guid}")]
  [Authorize]
  public async Task<IActionResult> GetMineById(Guid id, CancellationToken cancellationToken)
  {
    var result = await _teamService.GetMyTeamDetailAsync(id, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("mine/{id:guid}/members")]
  [Authorize]
  public async Task<IActionResult> GetMineMembers(Guid id, CancellationToken cancellationToken)
  {
    var result = await _teamService.GetMyTeamMembersAsync(id, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> Create([FromBody] CreateTeamRequest request, CancellationToken cancellationToken)
  {
    var result = await _teamService.CreateAsync(request, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPut("{id:guid}")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTeamRequest request, CancellationToken cancellationToken)
  {
    var result = await _teamService.UpdateAsync(id, request, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPatch("{id:guid}/status")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTeamStatusRequest request, CancellationToken cancellationToken)
  {
    var result = await _teamService.UpdateStatusAsync(id, request.IsActive, GetUserId(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}")]
  [Authorize(Roles = "Admin")]
  public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
  {
    var result = await _teamService.DeleteAsync(id, cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("{id:guid}/members")]
  [Authorize]
  public async Task<IActionResult> GetMembers(Guid id, CancellationToken cancellationToken)
  {
    var result = await _teamService.GetMembersAsync(id, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPost("{id:guid}/members")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> AddMember(Guid id, [FromBody] AddTeamMemberRequest request, CancellationToken cancellationToken)
  {
    var result = await _teamService.AddMemberAsync(id, request, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpPatch("{id:guid}/members/{userId:guid}")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> UpdateMember(
    Guid id,
    Guid userId,
    [FromBody] UpdateTeamMemberRequest request,
    CancellationToken cancellationToken)
  {
    var result = await _teamService.UpdateMemberAsync(id, userId, request, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  [HttpDelete("{id:guid}/members/{userId:guid}")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> RemoveMember(Guid id, Guid userId, CancellationToken cancellationToken)
  {
    var result = await _teamService.RemoveMemberAsync(id, userId, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }

  /// <summary>
  /// Admin/Editor-only — this is the raw Team/TeamMember audit trail (actor usernames included),
  /// not the Viewer-safe surface. A Viewer, even an active member of the team, has no view into
  /// Team activity per the task spec ("Team activity endpoint'ini kullanamaz") — My Teams exposes
  /// Overview/My Membership/Members only, never operational activity.
  /// </summary>
  [HttpGet("{id:guid}/activities")]
  [Authorize(Roles = "Admin,Editor")]
  public async Task<IActionResult> GetActivities(Guid id, CancellationToken cancellationToken)
  {
    var result = await _activityService.GetAllAsync(
      filter: a => a.EntityId == id.ToString() &&
        (a.EntityName == OperationalActivityActions.TeamEntity || a.EntityName == OperationalActivityActions.TeamMemberEntity),
      orderBy: q => q.OrderByDescending(a => a.CreatedDate),
      cancellationToken: cancellationToken);

    return CreateActionResult(result);
  }

  [HttpGet("/api/users/{userId:guid}/teams")]
  [Authorize]
  public async Task<IActionResult> GetTeamsForUser(Guid userId, CancellationToken cancellationToken)
  {
    var result = await _teamService.GetTeamsForUserAsync(userId, GetUserId(), GetPrimaryRole(), cancellationToken);

    return CreateActionResult(result);
  }
}
