using Api.Core.Repositories;
using Api.Data;

namespace Api.Features.Teams;

public class EfTeamMemberRepository : EfBaseRepository<BaseDbContext, TeamMember, Guid>, ITeamMemberRepository
{
  public EfTeamMemberRepository(BaseDbContext context) : base(context)
  {
  }
}
