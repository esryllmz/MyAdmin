using Riok.Mapperly.Abstractions;

namespace Api.Features.Teams;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.None)]
public partial class TeamMapper
{
  [MapperIgnoreTarget(nameof(Team.CreatedByUserId))]
  public partial Team CreateToEntity(CreateTeamRequest request);

  public partial void UpdateEntityFromRequest(UpdateTeamRequest request, Team entity);

  public partial CreatedTeamResponseDto EntityToCreatedResponseDto(Team entity);

  /// <summary>
  /// Team.Members / TeamMember.User.UserRoles are join-heavy aggregates (member counts, role
  /// names) that don't map cleanly through Mapperly's partial generation — built by hand instead
  /// of forcing an auto-mapper to guess at aggregation semantics.
  /// </summary>
  public TeamResponseDto EntityToResponseDto(Team entity)
  {
    var activeMembers = entity.Members.Where(m => m.IsActive).ToList();

    return new TeamResponseDto
    {
      Id = entity.Id,
      Name = entity.Name,
      Description = entity.Description,
      IsActive = entity.IsActive,
      CreatedDate = entity.CreatedDate,
      UpdatedDate = entity.UpdatedDate,
      CreatedByUserId = entity.CreatedByUserId,
      CreatedByUsername = entity.CreatedByUser?.Username,
      MemberCount = activeMembers.Count(m => m.MembershipRole == TeamMembershipRole.Member),
      ManagerCount = activeMembers.Count(m => m.MembershipRole == TeamMembershipRole.Manager),
    };
  }

  public List<TeamResponseDto> EntityToResponseDtoList(List<Team> entities) =>
    entities.Select(EntityToResponseDto).ToList();

  public TeamMemberResponseDto MemberEntityToResponseDto(TeamMember entity)
  {
    return new TeamMemberResponseDto
    {
      Id = entity.Id,
      TeamId = entity.TeamId,
      UserId = entity.UserId,
      Username = entity.User?.Username ?? string.Empty,
      Email = entity.User?.Email ?? string.Empty,
      ProfileImageUrl = entity.User?.ProfileImageUrl,
      ApplicationRole = entity.User?.UserRoles?.Select(ur => ur.Role?.Name).FirstOrDefault(name => name != null),
      MembershipRole = entity.MembershipRole,
      IsActive = entity.IsActive,
      JoinedDate = entity.JoinedDate,
    };
  }

  public List<TeamMemberResponseDto> MemberEntityToResponseDtoList(List<TeamMember> entities) =>
    entities.Select(MemberEntityToResponseDto).ToList();
}
