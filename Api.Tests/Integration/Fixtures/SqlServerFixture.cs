using Api.Data;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;
using Xunit;

namespace Api.Tests.Integration.Fixtures;

/// <summary>
/// One real, ephemeral SQL Server instance shared across every integration test in the
/// "Integration" collection (see IntegrationCollection). Deliberately not SQLite or InMemory —
/// this feature depends on transactions, ExecuteUpdateAsync conditional updates, a unique index,
/// and a self-referencing FK, none of which SQLite reliably exercises the same way SQL Server does.
/// </summary>
public class SqlServerFixture : IAsyncLifetime
{
  private readonly MsSqlContainer _container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest").Build();

  public string ConnectionString => _container.GetConnectionString();

  public async Task InitializeAsync()
  {
    await _container.StartAsync();

    await using var context = CreateContext();
    await context.Database.MigrateAsync();
  }

  public async Task DisposeAsync()
  {
    await _container.DisposeAsync();
  }

  public BaseDbContext CreateContext()
  {
    var options = new DbContextOptionsBuilder<BaseDbContext>()
      .UseSqlServer(ConnectionString)
      .Options;

    return new BaseDbContext(options);
  }
}

[CollectionDefinition("Integration")]
public class IntegrationCollection : ICollectionFixture<SqlServerFixture>
{
}
