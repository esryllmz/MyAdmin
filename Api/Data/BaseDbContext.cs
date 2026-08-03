using Api.Features.Activities;
using Api.Features.Notifications;
using Api.Features.Permissions;
using Api.Features.RolePermissions;
using Api.Features.Roles;
using Api.Features.Teams;
using Api.Features.UserRoles;
using Api.Features.Users;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace Api.Data;

public class BaseDbContext : DbContext
{
  public BaseDbContext(DbContextOptions<BaseDbContext> options) : base(options)
  {

  }

  public DbSet<User> Users { get; set; }
  public DbSet<Role> Roles { get; set; }
  public DbSet<Permission> Permissions { get; set; }
  public DbSet<UserRole> UserRoles { get; set; }
  public DbSet<RolePermission> RolePermissions { get; set; }
  public DbSet<Notification> Notifications { get; set; }
  public DbSet<Activity> Activities { get; set; }
  public DbSet<Team> Teams { get; set; }
  public DbSet<TeamMember> TeamMembers { get; set; }


  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

    SeedData.Seed(modelBuilder);
  }
}
