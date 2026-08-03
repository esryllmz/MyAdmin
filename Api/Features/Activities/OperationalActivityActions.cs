namespace Api.Features.Activities;

/// <summary>
/// Whitelist of Activity.Action values that count as "operational" for the Editor workspace —
/// Viewer account lifecycle and Team/membership management. Deliberately excludes role,
/// permission, API key, and security-policy actions, which stay Admin-only. Referenced both by
/// the services that write these rows (UserService, TeamService) and by
/// ActivitiesController.GetOperationalActivities so the whitelist can't drift out of sync.
/// </summary>
public static class OperationalActivityActions
{
  public const string ViewerAccountCreated = "ViewerAccountCreated";
  public const string ViewerProfileUpdated = "ViewerProfileUpdated";
  public const string ViewerStatusActivated = "ViewerStatusActivated";
  public const string ViewerStatusDeactivated = "ViewerStatusDeactivated";
  public const string TeamCreated = "TeamCreated";
  public const string TeamUpdated = "TeamUpdated";
  public const string TeamStatusActivated = "TeamStatusActivated";
  public const string TeamStatusDeactivated = "TeamStatusDeactivated";
  public const string TeamMemberAdded = "TeamMemberAdded";
  public const string TeamMemberRemoved = "TeamMemberRemoved";
  public const string TeamMemberRoleChanged = "TeamMemberRoleChanged";

  public static readonly string[] All =
  [
    ViewerAccountCreated,
    ViewerProfileUpdated,
    ViewerStatusActivated,
    ViewerStatusDeactivated,
    TeamCreated,
    TeamUpdated,
    TeamStatusActivated,
    TeamStatusDeactivated,
    TeamMemberAdded,
    TeamMemberRemoved,
    TeamMemberRoleChanged,
  ];

  public const string UserEntity = "User";
  public const string TeamEntity = "Team";
  public const string TeamMemberEntity = "TeamMember";
}
