using Api.Core.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace Api.Data;

public class UnitOfWork(BaseDbContext _context) : IUnitOfWork
{
  public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
  {
    return await _context.SaveChangesAsync(cancellationToken);
  }

  public async ValueTask DisposeAsync()
  {
    await _context.DisposeAsync();
  }

  public async Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
  {
    return await _context.Database.BeginTransactionAsync(cancellationToken);
  }
}
