using Api.Core.Repositories;
using Api.Core.Responses;
using Api.Features.Activities;
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

    await LogActivityAsync(OperationalActivityActions.TeamMemberAdded, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{targetUser.Username} added to team as {request.MembershipRole}.", cancellationToken);

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

    await LogActivityAsync(OperationalActivityActions.TeamMemberRoleChanged, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{member.User?.Username} membership role changed to {request.MembershipRole}.", cancellationToken);

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

    _teamMemberRepository.Delete(member);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await LogActivityAsync(OperationalActivityActions.TeamMemberRemoved, OperationalActivityActions.TeamMemberEntity,
      teamId.ToString(), callerUserId, $"{targetUsername} removed from team.", cancellationToken);

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
      include: q => q.Include(tm => tm.Team).ThenInclude(t => t.CreatedByUser).Include(tm => tm.Team).ThenInclude(t => t.Members),
      cancellationToken: cancellationToken);

    var teams = memberships.Select(m => m.Team).DistinctBy(t => t.Id).ToList();

    return new ReturnModel<List<TeamResponseDto>>
    {
      Success = true,
      Message = "Teams retrieved successfully.",
      StatusCode = 200,
      Data = _mapper.EntityToResponseDtoList(teams),
    };
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
