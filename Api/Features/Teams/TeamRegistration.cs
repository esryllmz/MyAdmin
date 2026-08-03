namespace Api.Features.Teams;

public static class TeamRegistration
{
  public static IServiceCollection AddTeamDependencies(this IServiceCollection services)
  {
    services.AddScoped<ITeamRepository, EfTeamRepository>();
    services.AddScoped<ITeamMemberRepository, EfTeamMemberRepository>();
    services.AddScoped<ITeamService, TeamService>();
    services.AddScoped<TeamBusinessRules>();
    services.AddSingleton<TeamMapper>();

    return services;
  }
}
