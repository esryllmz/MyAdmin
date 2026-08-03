using Api.Core.Exceptions;
using Api.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Features.Teams;

public class TeamBusinessRules(
  ITeamRepository _teamRepository,
  ITeamMemberRepository _teamMemberRepository,
  ILogger<TeamBusinessRules> _logger)
{
  public async Task<Team> GetTeamIfExistAsync(
    Guid id,
    Func<IQueryable<Team>, IQueryable<Team>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default)
  {
    var team = await _teamRepository.GetByIdAsync(id, include, enableTracking, cancellationToken);

    if (team == null)
    {
      _logger.LogWarning("Team not found. ID: {TeamId}", id);

      throw new NotFoundException($"Team {id} was not found.");
    }

    return team;
  }

  public async Task<TeamMember> GetTeamMemberIfExistAsync(
    Guid teamId,
    Guid userId,
    Func<IQueryable<TeamMember>, IQueryable<TeamMember>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default)
  {
    var member = await _teamMemberRepository.GetAsync(
      predicate: tm => tm.TeamId == teamId && tm.UserId == userId,
      include: include,
      enableTracking: enableTracking,
      cancellationToken: cancellationToken);

    if (member == null)
    {
      _logger.LogWarning("Team member not found. Team: {TeamId}, User: {UserId}", teamId, userId);

      throw new NotFoundException("This user is not a member of the team.");
    }

    return member;
  }

  public async Task TeamNameMustBeUniqueAsync(string name, Guid? excludeTeamId, CancellationToken cancellationToken)
  {
    var exists = await _teamRepository.AnyAsync(
      t => t.Name == name && (excludeTeamId == null || t.Id != excludeTeamId),
      cancellationToken);

    if (exists)
    {
      _logger.LogWarning("Duplicate team name rejected: {Name}", name);

      throw new ConflictException("A team with this name already exists.");
    }
  }

  public async Task MemberMustNotAlreadyExistAsync(Guid teamId, Guid userId, CancellationToken cancellationToken)
  {
    var exists = await _teamMemberRepository.AnyAsync(
      tm => tm.TeamId == teamId && tm.UserId == userId && tm.IsActive,
      cancellationToken);

    if (exists)
    {
      _logger.LogWarning("Duplicate team membership rejected. Team: {TeamId}, User: {UserId}", teamId, userId);

      throw new ConflictException("This user is already a member of the team.");
    }
  }

  /// <summary>
  /// Editor's entire mandate is Viewer-user operations — an Editor may only add, retarget, or
  /// remove members whose application role (Admin/Editor/Viewer) is Viewer. Admin is exempt.
  /// </summary>
  public void EditorMayOnlyTargetViewerMembers(string callerRole, User targetUser)
  {
    if (callerRole != "Editor")
    {
      return;
    }

    var targetApplicationRole = targetUser.UserRoles?.Select(ur => ur.Role?.Name).FirstOrDefault(name => name != null);

    if (targetApplicationRole != "Viewer")
    {
      _logger.LogWarning(
        "Editor attempted to manage a non-Viewer team member. Target: {TargetUserId}, TargetRole: {TargetRole}",
        targetUser.Id, targetApplicationRole);

      throw new ForbiddenException("Editors can only manage Viewer team memberships.");
    }
  }

  public void EditorCannotAssignOwnerRole(string callerRole, string membershipRole)
  {
    if (callerRole == "Editor" && membershipRole == TeamMembershipRole.Owner)
    {
      _logger.LogWarning("Editor attempted to assign the Owner membership role.");

      throw new ForbiddenException("Only Admins can assign the Owner role.");
    }
  }

  public void EditorCannotManageExistingOwner(string callerRole, TeamMember member)
  {
    if (callerRole == "Editor" && member.MembershipRole == TeamMembershipRole.Owner)
    {
      _logger.LogWarning("Editor attempted to manage an Owner-level team member.");

      throw new ForbiddenException("Editors cannot manage Owner-level team members.");
    }
  }

  /// <summary>
  /// A Viewer may look at a team's detail/members only if they are themselves an active member
  /// of it — this is the backend-side IDOR guard even though the current frontend doesn't yet
  /// expose a Teams surface to Viewer.
  /// </summary>
  public async Task ViewerMustBeActiveMemberAsync(Guid teamId, Guid callerUserId, string callerRole, CancellationToken cancellationToken)
  {
    if (callerRole != "Viewer")
    {
      return;
    }

    var isMember = await _teamMemberRepository.AnyAsync(
      tm => tm.TeamId == teamId && tm.UserId == callerUserId && tm.IsActive,
      cancellationToken);

    if (!isMember)
    {
      _logger.LogWarning("Viewer attempted to access a team they don't belong to. Team: {TeamId}, User: {UserId}", teamId, callerUserId);

      throw new ForbiddenException("You are not a member of this team.");
    }
  }
}
