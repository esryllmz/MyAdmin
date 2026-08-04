using Api.Core.Exceptions;
using Api.Core.Repositories;
using Api.Core.Responses;
using Api.Features.Activities;
using Api.Features.Notifications;
using Api.Features.Users;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Teams;

public class TeamService(
  ITeamRepository _teamRepository,
  ITeamMemberRepository _teamMemberRepository,
  UserBusinessRules _userBusinessRules,
  TeamMapper _mapper,
  TeamBusinessRules _businessRules,
  IActivityService _activityService,
  INotificationService _notificationService,
  IUnitOfWork _unitOfWork,
  IValidator<CreateTeamRequest> _createValidator,
  IValidator<UpdateTeamRequest> _updateValidator,
  IValidator<AddTeamMemberRequest> _addMemberValidator,
  IValidator<UpdateTeamMemberRequest> _updateMemberValidator,
  ILogger<TeamService> _logger) : ITeamService
{
  private static readonly Func<IQueryable<Team>, IQueryable<Team>> IncludeForResponse =
    q => q.Include(t => t.CreatedByUser).Include(t => t.Members);

  private static readonly Func<IQueryable<TeamMember>, IQueryable<TeamMember>> IncludeMemberUser =
    q => q.Include(tm => tm.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role);

  public async Task<ReturnModel<PagedResult<TeamResponseDto>>> GetAllAsync(
    TeamListQuery query,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Listing teams. Search: {Search}, IsActive: {IsActive}", query.Search, query.IsActive);

    var page = Math.Max(1, query.Page);
    var pageSize = Math.Clamp(query.PageSize, 1, 100);
    var search = query.Search?.Trim();

    var all = await _teamRepository.GetAllAsync(
      filter: t =>
        (string.IsNullOrEmpty(search) || t.Name.Contains(search)) &&
        (query.IsActive == null || t.IsActive == query.IsActive),
      include: IncludeForResponse,
      orderBy: q => query.Sort switch
      {
        "name" => q.OrderBy(t => t.Name),
        "oldest" => q.OrderBy(t => t.CreatedDate),
        _ => q.OrderByDescending(t => t.UpdatedDate ?? t.CreatedDate),
      },
      cancellationToken: cancellationToken);

    var totalCount = all.Count;
    var pageItems = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

    return new ReturnModel<PagedResult<TeamResponseDto>>
    {
      Success = true,
      Message = "Teams retrieved successfully.",
      StatusCode = 200,
      Data = new PagedResult<TeamResponseDto>
      {
        Items = _mapper.EntityToResponseDtoList(pageItems),
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize,
      },
    };
  }

  public async Task<ReturnModel<TeamResponseDto>> GetByIdAsync(
    Guid id,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    await _businessRules.ViewerMustBeActiveMemberAsync(id, callerUserId, callerRole, cancellationToken);

    var team = await _businessRules.GetTeamIfExistAsync(id, include: IncludeForResponse, cancellationToken: cancellationToken);

    return new ReturnModel<TeamResponseDto>
    {
      Success = true,
      Message = "Team retrieved successfully.",
      StatusCode = 200,
      Data = _mapper.EntityToResponseDto(team),
    };
  }

  public async Task<ReturnModel<CreatedTeamResponseDto>> CreateAsync(
    CreateTeamRequest request,
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var validationResult = await _createValidator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
      throw new ValidationException(validationResult.Errors);
    }

    await _businessRules.TeamNameMustBeUniqueAsync(request.Name, null, cancellationToken);

    var team = _mapper.CreateToEntity(request);
    team.CreatedByUserId = callerUserId;

    await _teamRepository.AddAsync(team, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamCreated, OperationalActivityActions.TeamEntity,
      team.Id.ToString(), callerUserId, $"Team '{team.Name}' created.", cancellationToken);

    _logger.LogInformation("Team created. ID: {TeamId}", team.Id);

    return new ReturnModel<CreatedTeamResponseDto>
    {
      Success = true,
      Message = "Team created successfully.",
      StatusCode = 201,
      Data = _mapper.EntityToCreatedResponseDto(team),
    };
  }

  public async Task<ReturnModel<NoData>> UpdateAsync(
    Guid id,
    UpdateTeamRequest request,
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
      throw new ValidationException(validationResult.Errors);
    }

    var team = await _businessRules.GetTeamIfExistAsync(id, enableTracking: true, cancellationToken: cancellationToken);

    if (team.Name != request.Name)
    {
      await _businessRules.TeamNameMustBeUniqueAsync(request.Name, id, cancellationToken);
    }

    _mapper.UpdateEntityFromRequest(request, team);

    _teamRepository.Update(team);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamUpdated, OperationalActivityActions.TeamEntity,
      team.Id.ToString(), callerUserId, $"Team '{team.Name}' updated.", cancellationToken);

    await NotifyActiveViewerMembersAsync(team.Id, $"\"{team.Name}\" was updated.", $"/my-teams/{team.Id}", cancellationToken);

    return new ReturnModel<NoData>
    {
      Success = true,
      Message = "Team updated successfully.",
      StatusCode = 200,
    };
  }

  public async Task<ReturnModel<NoData>> UpdateStatusAsync(
    Guid id,
    bool isActive,
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var team = await _businessRules.GetTeamIfExistAsync(id, enableTracking: true, cancellationToken: cancellationToken);

    team.IsActive = isActive;

    _teamRepository.Update(team);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await LogActivityAsync(
      isActive ? OperationalActivityActions.TeamStatusActivated : OperationalActivityActions.TeamStatusDeactivated,
      OperationalActivityActions.TeamEntity, team.Id.ToString(), callerUserId,
      $"Team '{team.Name}' {(isActive ? "activated" : "deactivated")}.", cancellationToken);

    await NotifyActiveViewerMembersAsync(
      team.Id,
      isActive ? $"\"{team.Name}\" was reactivated." : $"\"{team.Name}\" was deactivated.",
      $"/my-teams/{team.Id}",
      cancellationToken);

    return new ReturnModel<NoData>
    {
      Success = true,
      Message = isActive ? "Team activated." : "Team deactivated.",
      StatusCode = 200,
    };
  }

  public async Task<ReturnModel<NoData>> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
  {
    var team = await _businessRules.GetTeamIfExistAsync(id, enableTracking: true, cancellationToken: cancellationToken);

    _teamRepository.Delete(team);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    _logger.LogInformation("Team deleted. ID: {TeamId}", id);

    return new ReturnModel<NoData>
    {
      Success = true,
      Message = "Team deleted successfully.",
      StatusCode = 200,
    };
  }

  public async Task<ReturnModel<List<TeamMemberResponseDto>>> GetMembersAsync(
    Guid teamId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    await _businessRules.ViewerMustBeActiveMemberAsync(teamId, callerUserId, callerRole, cancellationToken);
    await _businessRules.GetTeamIfExistAsync(teamId, cancellationToken: cancellationToken);

    var members = await _teamMemberRepository.GetAllAsync(
      filter: tm => tm.TeamId == teamId && tm.IsActive,
      include: IncludeMemberUser,
      orderBy: q => q.OrderBy(tm => tm.CreatedDate),
      cancellationToken: cancellationToken);

    return new ReturnModel<List<TeamMemberResponseDto>>
    {
      Success = true,
      Message = "Team members retrieved successfully.",
      StatusCode = 200,
      Data = _mapper.MemberEntityToResponseDtoList(members),
    };
  }

  public async Task<ReturnModel<TeamMemberResponseDto>> AddMemberAsync(
    Guid teamId,
    AddTeamMemberRequest request,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    var validationResult = await _addMemberValidator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
      throw new ValidationException(validationResult.Errors);
    }

    await _businessRules.GetTeamIfExistAsync(teamId, cancellationToken: cancellationToken);

    var targetUser = await _userBusinessRules.GetUserIfExistAsync(
      request.UserId,
      include: q => q.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
      cancellationToken: cancellationToken);

    _businessRules.EditorMayOnlyTargetViewerMembers(callerRole, targetUser);
    _businessRules.EditorCannotAssignOwnerRole(callerRole, request.MembershipRole);
    await _businessRules.MemberMustNotAlreadyExistAsync(teamId, request.UserId, cancellationToken);

    var member = new TeamMember
    {
      TeamId = teamId,
      UserId = request.UserId,
      MembershipRole = request.MembershipRole,
      AddedByUserId = callerUserId,
    };

    await _teamMemberRepository.AddAsync(member, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    var team = await _businessRules.GetTeamIfExistAsync(teamId, cancellationToken: cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamMemberAdded, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{targetUser.Username} added to team as {request.MembershipRole}.", cancellationToken);

    await LogActivityAsync(OperationalActivityActions.ViewerAddedToTeam, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), targetUser.Id, $"Added to team as {request.MembershipRole}.", cancellationToken);

    await NotifyMemberAsync(targetUser.Id, $"You were added to \"{team.Name}\".", $"/my-teams/{teamId}", cancellationToken);

    member.User = targetUser;

    return new ReturnModel<TeamMemberResponseDto>
    {
      Success = true,
      Message = "Member added successfully.",
      StatusCode = 201,
      Data = _mapper.MemberEntityToResponseDto(member),
    };
  }

  public async Task<ReturnModel<NoData>> UpdateMemberAsync(
    Guid teamId,
    Guid userId,
    UpdateTeamMemberRequest request,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    var validationResult = await _updateMemberValidator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
      throw new ValidationException(validationResult.Errors);
    }

    var member = await _businessRules.GetTeamMemberIfExistAsync(
      teamId, userId, include: IncludeMemberUser, enableTracking: true, cancellationToken: cancellationToken);

    if (member.User != null)
    {
      _businessRules.EditorMayOnlyTargetViewerMembers(callerRole, member.User);
    }
    _businessRules.EditorCannotManageExistingOwner(callerRole, member);
    _businessRules.EditorCannotAssignOwnerRole(callerRole, request.MembershipRole);

    member.MembershipRole = request.MembershipRole;

    _teamMemberRepository.Update(member);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    var teamForRoleChange = await _businessRules.GetTeamIfExistAsync(teamId, cancellationToken: cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamMemberRoleChanged, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{member.User?.Username} membership role changed to {request.MembershipRole}.", cancellationToken);

    await LogActivityAsync(OperationalActivityActions.ViewerTeamRoleChanged, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), userId, $"Team role changed to {request.MembershipRole}.", cancellationToken);

    await NotifyMemberAsync(userId, $"Your team role in \"{teamForRoleChange.Name}\" changed to {request.MembershipRole}.",
      $"/my-teams/{teamId}", cancellationToken);

    return new ReturnModel<NoData>
    {
      Success = true,
      Message = "Membership updated successfully.",
      StatusCode = 200,
    };
  }

  public async Task<ReturnModel<NoData>> RemoveMemberAsync(
    Guid teamId,
    Guid userId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    var member = await _businessRules.GetTeamMemberIfExistAsync(
      teamId, userId, include: IncludeMemberUser, enableTracking: true, cancellationToken: cancellationToken);

    if (member.User != null)
    {
      _businessRules.EditorMayOnlyTargetViewerMembers(callerRole, member.User);
    }
    _businessRules.EditorCannotManageExistingOwner(callerRole, member);

    var targetUsername = member.User?.Username;
    var team = await _businessRules.GetTeamIfExistAsync(teamId, cancellationToken: cancellationToken);

    _teamMemberRepository.Delete(member);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamMemberRemoved, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{targetUsername} removed from team.", cancellationToken);

    await LogActivityAsync(OperationalActivityActions.ViewerRemovedFromTeam, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), userId, "Removed from team.", cancellationToken);

    await NotifyMemberAsync(userId, $"You were removed from \"{team.Name}\".", "/my-teams", cancellationToken);

    return new ReturnModel<NoData>
    {
      Success = true,
      Message = "Member removed successfully.",
      StatusCode = 200,
    };
  }

  public async Task<ReturnModel<List<TeamResponseDto>>> GetTeamsForUserAsync(
    Guid targetUserId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    if (callerRole == "Viewer" && targetUserId != callerUserId)
    {
      _logger.LogWarning("Viewer attempted to view another user's teams. Requester: {CallerUserId}, Target: {TargetUserId}", callerUserId, targetUserId);

      throw new Core.Exceptions.ForbiddenException("You can only view your own teams.");
    }

    var memberships = await _teamMemberRepository.GetAllAsync(
      filter: tm => tm.UserId == targetUserId && tm.IsActive,
      include: q => q.Include(tm => tm.Team).ThenInclude(t => t.CreatedByUser),
      cancellationToken: cancellationToken);

    var teams = memberships.Select(m => m.Team).DistinctBy(t => t.Id).ToList();
    await AttachActiveMembersAsync(teams, cancellationToken);

    return new ReturnModel<List<TeamResponseDto>>
    {
      Success = true,
      Message = "Teams retrieved successfully.",
      StatusCode = 200,
      Data = _mapper.EntityToResponseDtoList(teams),
    };
  }

  public async Task<ReturnModel<List<MyTeamResponseDto>>> GetMyTeamsAsync(
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var memberships = await _teamMemberRepository.GetAllAsync(
      filter: tm => tm.UserId == callerUserId && tm.IsActive,
      include: q => q.Include(tm => tm.Team),
      orderBy: q => q.OrderByDescending(tm => tm.Team.UpdatedDate ?? tm.Team.CreatedDate),
      cancellationToken: cancellationToken);

    await AttachActiveMembersAsync(memberships.Select(m => m.Team).ToList(), cancellationToken);

    return new ReturnModel<List<MyTeamResponseDto>>
    {
      Success = true,
      Message = "Your teams retrieved successfully.",
      StatusCode = 200,
      Data = memberships.Select(ToMyTeamResponseDto).ToList(),
    };
  }

  public async Task<ReturnModel<MyTeamResponseDto>> GetMyTeamDetailAsync(
    Guid teamId,
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var membership = await _teamMemberRepository.GetAsync(
      predicate: tm => tm.TeamId == teamId && tm.UserId == callerUserId && tm.IsActive,
      include: q => q.Include(tm => tm.Team),
      cancellationToken: cancellationToken);

    if (membership == null)
    {
      _logger.LogWarning("User attempted to view a team they don't belong to. Team: {TeamId}, User: {UserId}", teamId, callerUserId);

      throw new NotFoundException("Team not found.");
    }

    await AttachActiveMembersAsync([membership.Team], cancellationToken);

    return new ReturnModel<MyTeamResponseDto>
    {
      Success = true,
      Message = "Team retrieved successfully.",
      StatusCode = 200,
      Data = ToMyTeamResponseDto(membership),
    };
  }

  public async Task<ReturnModel<List<MyTeamMemberResponseDto>>> GetMyTeamMembersAsync(
    Guid teamId,
    Guid callerUserId,
    CancellationToken cancellationToken = default)
  {
    var isMember = await _teamMemberRepository.AnyAsync(
      tm => tm.TeamId == teamId && tm.UserId == callerUserId && tm.IsActive,
      cancellationToken);

    if (!isMember)
    {
      _logger.LogWarning("User attempted to list members of a team they don't belong to. Team: {TeamId}, User: {UserId}", teamId, callerUserId);

      throw new NotFoundException("Team not found.");
    }

    var members = await _teamMemberRepository.GetAllAsync(
      filter: tm => tm.TeamId == teamId && tm.IsActive,
      include: q => q.Include(tm => tm.User),
      orderBy: q => q.OrderBy(tm => tm.CreatedDate),
      cancellationToken: cancellationToken);

    return new ReturnModel<List<MyTeamMemberResponseDto>>
    {
      Success = true,
      Message = "Team members retrieved successfully.",
      StatusCode = 200,
      Data = members.Select(m => new MyTeamMemberResponseDto(
        m.UserId,
        m.User?.Username ?? string.Empty,
        m.User?.ProfileImageUrl,
        m.MembershipRole,
        m.IsActive)).ToList(),
    };
  }

  /// <summary>
  /// Populates Team.Members in-memory from a separate, flat query instead of
  /// `.Include(tm => tm.Team).ThenInclude(t => t.Members)` — that chain closes a
  /// TeamMember→Team→Members(TeamMember) loop that EF Core's no-tracking cycle detection
  /// rejects outright ("The Include path 'Team->Members' results in a cycle"), which is exactly
  /// what was turning every GetTeamsForUserAsync/GetMyTeamsAsync call into an unconditional 500.
  /// </summary>
  private async Task AttachActiveMembersAsync(List<Team> teams, CancellationToken cancellationToken)
  {
    if (teams.Count == 0)
    {
      return;
    }

    var teamIds = teams.Select(t => t.Id).ToList();

    var members = await _teamMemberRepository.GetAllAsync(
      filter: tm => teamIds.Contains(tm.TeamId) && tm.IsActive,
      cancellationToken: cancellationToken);

    var membersByTeamId = members.GroupBy(m => m.TeamId).ToDictionary(g => g.Key, g => (ICollection<TeamMember>)g.ToList());

    foreach (var team in teams)
    {
      team.Members = membersByTeamId.TryGetValue(team.Id, out var teamMembers) ? teamMembers : [];
    }
  }

  private static MyTeamResponseDto ToMyTeamResponseDto(TeamMember membership)
  {
    var team = membership.Team;
    var activeMemberCount = team.Members.Count(m => m.IsActive);

    return new MyTeamResponseDto(
      team.Id,
      team.Name,
      team.Description,
      team.IsActive,
      membership.MembershipRole,
      membership.JoinedDate,
      activeMemberCount,
      team.UpdatedDate);
  }

  private async Task NotifyMemberAsync(Guid userId, string message, string linkUrl, CancellationToken cancellationToken)
  {
    await _notificationService.AddAsync(new CreateNotificationRequest(
      Title: "Team update",
      Message: message,
      UserId: userId,
      Type: "INFO",
      LinkUrl: linkUrl), cancellationToken);
  }

  /// <summary>
  /// Notifies active Viewer-role members only — Editor/Admin members (e.g. an Owner/Manager who
  /// isn't a Viewer) don't get a Viewer-workspace notification for their own team actions.
  /// </summary>
  private async Task NotifyActiveViewerMembersAsync(Guid teamId, string message, string linkUrl, CancellationToken cancellationToken)
  {
    var members = await _teamMemberRepository.GetAllAsync(
      filter: tm => tm.TeamId == teamId && tm.IsActive,
      include: q => q.Include(tm => tm.User).ThenInclude(u => u.UserRoles).ThenInclude(ur => ur.Role),
      cancellationToken: cancellationToken);

    var viewerMemberIds = members
      .Where(m => m.User?.UserRoles?.Any(ur => ur.Role?.Name == "Viewer") == true)
      .Select(m => m.UserId);

    foreach (var viewerId in viewerMemberIds)
    {
      await NotifyMemberAsync(viewerId, message, linkUrl, cancellationToken);
    }
  }

  private async Task LogActivityAsync(
    string action,
    string entityName,
    string entityId,
    Guid actorUserId,
    string summary,
    CancellationToken cancellationToken)
  {
    await _activityService.AddAsync(new CreateActivityRequest(
      Action: action,
      EntityName: entityName,
      EntityId: entityId,
      NewValues: summary,
      UserId: actorUserId), cancellationToken);
  }
}
