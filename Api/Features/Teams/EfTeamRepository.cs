using Api.Core.Repositories;
using Api.Data;

namespace Api.Features.Teams;

public class EfTeamRepository : EfBaseRepository<BaseDbContext, Team, Guid>, ITeamRepository
{
  public EfTeamRepository(BaseDbContext context) : base(context)
  {
  }
}
