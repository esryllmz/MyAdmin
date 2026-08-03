using Api.Core.Entities;
using Api.Features.Users;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Teams;

/// <summary>
/// Team membership role — distinct from the application role (Admin/Editor/Viewer, see
/// Api/Data/SeedData.cs). A Viewer's application role never changes by joining a team; only
/// their standing (Member/Manager/Owner) within that specific team does.
/// </summary>
public static class TeamMembershipRole
{
  public const string Member = "Member";
  public const string Manager = "Manager";
  public const string Owner = "Owner";

  public static readonly string[] All = [Member, Manager, Owner];
}

public class TeamMember : Entity<Guid>
{
  [SetsRequiredMembers]
  public TeamMember()
  {
  }

  public required Guid TeamId { get; set; }
  public virtual Team Team { get; set; } = default!;

  public required Guid UserId { get; set; }
  public virtual User User { get; set; } = default!;

  public string MembershipRole { get; set; } = TeamMembershipRole.Member;
  public bool IsActive { get; set; } = true;

  public required Guid AddedByUserId { get; set; }
  public virtual User AddedByUser { get; set; } = default!;

  // CreatedDate (base Entity) already carries the join timestamp — exposed under a
  // domain-meaningful name instead of a duplicate mapped column (same pattern as
  // Notification.ReadAt aliasing UpdatedDate).
  [NotMapped]
  public DateTime JoinedDate => CreatedDate;
}
