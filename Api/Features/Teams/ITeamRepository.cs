using Api.Core.Repositories;

namespace Api.Features.Teams;

public interface ITeamRepository : IRepository<Team, Guid>
{
}
