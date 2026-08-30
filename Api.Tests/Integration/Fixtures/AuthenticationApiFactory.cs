using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Api.Tests.Integration.Fixtures;

/// <summary>
/// Boots the real ASP.NET Core pipeline (Program.cs, middleware, DI, JWT validation, CORS, the
/// real AuthenticationController) against the shared Testcontainers SQL Server instance — used
/// for tests that must observe actual HTTP behavior (Set-Cookie headers, status codes, JSON
/// response shape), not just service-layer method calls.
/// </summary>
public class AuthenticationApiFactory(string connectionString) : WebApplicationFactory<Program>
{
  protected override void ConfigureWebHost(IWebHostBuilder builder)
  {
    builder.UseEnvironment("Development");

    // Deliberately does NOT override TokenOptions — appsettings.Development.json's real values
    // are already internally consistent (they're what a real `dotnet run` uses), so reusing them
    // here avoids any risk of the JWT-signing config and the JWT-validation config disagreeing.
    builder.ConfigureAppConfiguration((_, config) =>
    {
      config.AddInMemoryCollection(new Dictionary<string, string?>
      {
        ["FrontendUrl"] = "http://localhost:3000",
        ["ConnectionStrings:SqlConnection"] = connectionString,
      });
    });

    // Program.cs runs DevelopmentDataSeeder directly (not as a hosted service) whenever the
    // environment is Development. It's idempotent and harmless against the shared container
    // database — every test still creates and asserts against its own distinct user(s).
  }
}
