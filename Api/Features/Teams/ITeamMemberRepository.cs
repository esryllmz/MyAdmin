using Api.Core.Repositories;

namespace Api.Features.Teams;

public interface ITeamMemberRepository : IRepository<TeamMember, Guid>
{
}
