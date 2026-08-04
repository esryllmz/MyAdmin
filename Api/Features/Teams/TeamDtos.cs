namespace Api.Features.Teams;

public sealed record CreateTeamRequest(
  string Name,
  string? Description = null);

public sealed record UpdateTeamRequest(
  string Name,
  string? Description = null);

public sealed record UpdateTeamStatusRequest(bool IsActive);

public sealed record AddTeamMemberRequest(
  Guid UserId,
  string MembershipRole = TeamMembershipRole.Member);

public sealed record UpdateTeamMemberRequest(string MembershipRole);

public class TeamResponseDto
{
  public Guid Id { get; set; }
  public string Name { get; set; } = null!;
  public string? Description { get; set; }
  public bool IsActive { get; set; }
  public DateTime CreatedDate { get; set; }
  public DateTime? UpdatedDate { get; set; }
  public Guid CreatedByUserId { get; set; }
  public string? CreatedByUsername { get; set; }
  public int MemberCount { get; set; }
  public int ManagerCount { get; set; }
}

public sealed record CreatedTeamResponseDto(
  Guid Id,
  string Name);

public class TeamMemberResponseDto
{
  public Guid Id { get; set; }
  public Guid TeamId { get; set; }
  public Guid UserId { get; set; }
  public string Username { get; set; } = null!;
  public string Email { get; set; } = null!;
  public string? ProfileImageUrl { get; set; }
  /// <summary>Application role (Admin/Editor/Viewer) — informational only, never editable here.</summary>
  public string? ApplicationRole { get; set; }
  public string MembershipRole { get; set; } = null!;
  public bool IsActive { get; set; }
  public DateTime JoinedDate { get; set; }
}

public sealed record TeamActivityResponseDto(
  Guid Id,
  string Action,
  string? ActorUsername,
  string? TargetUsername,
  DateTime CreatedDate);

/// <summary>
/// Viewer-facing "My Teams" projection — deliberately excludes CreatedByUserId/Username, manager
/// counts and other management-oriented fields that TeamResponseDto carries for Admin/Editor.
/// A Viewer only ever sees teams they actively belong to (see TeamService.GetMyTeamsAsync).
/// </summary>
public sealed record MyTeamResponseDto(
  Guid Id,
  string Name,
  string? Description,
  bool IsActive,
  string MembershipRole,
  DateTime JoinedDate,
  int MemberCount,
  DateTime? UpdatedDate);

/// <summary>
/// Viewer-facing team member row — no email, no application role, no internal/added-by IDs.
/// </summary>
public sealed record MyTeamMemberResponseDto(
  Guid UserId,
  string Username,
  string? ProfileImageUrl,
  string MembershipRole,
  bool IsActive);
