using Api.Core.Repositories;
using Microsoft.EntityFrameworkCore;


namespace Api.Data;

public static class DataRegistration
{
  public static IServiceCollection AddDataDependencies(this IServiceCollection services, IConfiguration configuration)
  {
    var connectionString = configuration.GetConnectionString("SqlConnection");

    if (string.IsNullOrWhiteSpace(connectionString) ||
        connectionString.Contains("YOUR_SERVER", StringComparison.OrdinalIgnoreCase) ||
        connectionString.Contains("YOUR_DATABASE", StringComparison.OrdinalIgnoreCase))
    {
      throw new InvalidOperationException("ConnectionStrings:SqlConnection yapılandırması eksik veya placeholder değer içeriyor.");
    }

    services.AddDbContext<BaseDbContext>(options =>
    {
      options.UseSqlServer(connectionString);
    });

    services.AddScoped<IUnitOfWork, UnitOfWork>();

    return services;
  }
}
