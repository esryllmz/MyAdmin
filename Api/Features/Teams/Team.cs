using Api.Core.Entities;
using Api.Features.Users;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Teams;

public class Team : Entity<Guid>
{
  [SetsRequiredMembers]
  public Team()
  {
    Members = new HashSet<TeamMember>();

    Name = default!;
  }

  public required string Name { get; set; }
  public string? Description { get; set; }
  public bool IsActive { get; set; } = true;

  public required Guid CreatedByUserId { get; set; }
  public virtual User CreatedByUser { get; set; } = default!;

  // Navigation properties
  public virtual ICollection<TeamMember> Members { get; set; }
}
