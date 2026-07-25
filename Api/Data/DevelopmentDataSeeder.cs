using Api.Core.Security;
using Api.Features.Roles;
using Api.Features.UserRoles;
using Api.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

/// <summary>
/// Development-only, idempotent seeder. Creates a default admin account
/// (admin@myadmin.com / Admin123!, overridable via MYADMIN_SEED_ADMIN_EMAIL /
/// MYADMIN_SEED_ADMIN_PASSWORD) so the app can be logged into without any
/// manual database work. Must only ever be invoked from a Development-gated
/// call site (see Program.cs) — this method performs no environment check
/// of its own.
/// </summary>
public static class DevelopmentDataSeeder
{
  private const string DefaultAdminEmail = "admin@myadmin.com";
  private const string DefaultAdminPassword = "Admin123!";
  private const string DefaultAdminUsername = "admin";
  private const string AdminRoleName = "Admin";

  public static async Task SeedAsync(
    IServiceProvider services,
    CancellationToken cancellationToken = default)
  {
    using var scope = services.CreateScope();
    var provider = scope.ServiceProvider;

    var context = provider.GetRequiredService<BaseDbContext>();
    var configuration = provider.GetRequiredService<IConfiguration>();
    var logger = provider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DevelopmentDataSeeder));

    // Migration/veritabanının hazır olduğundan emin ol — mevcut migration'ları
    // uygular, yeni bir migration üretmez; hepsi zaten güncelse no-op'tur.
    await context.Database.MigrateAsync(cancellationToken);

    var adminRole = await context.Roles
      .AsNoTracking()
      .FirstOrDefaultAsync(r => r.Name == AdminRoleName, cancellationToken);

    if (adminRole == null)
    {
      throw new InvalidOperationException(
        $"Development admin seed işlemi başarısız: '{AdminRoleName}' rolü veritabanında bulunamadı. " +
        "SeedData.cs içindeki Role seed verisi eksik veya migration uygulanmamış olabilir.");
    }

    var email = configuration["MYADMIN_SEED_ADMIN_EMAIL"];
    var password = configuration["MYADMIN_SEED_ADMIN_PASSWORD"];

    if (string.IsNullOrWhiteSpace(email))
    {
      email = DefaultAdminEmail;
    }

    if (string.IsNullOrWhiteSpace(password))
    {
      password = DefaultAdminPassword;
    }

    var normalizedEmail = email.Trim().ToLowerInvariant();

    var existingUser = await context.Users
      .AsNoTracking()
      .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, cancellationToken);

    if (existingUser == null)
    {
      HashingHelper.CreatePasswordHash(password, out var passwordHash, out var passwordKey);

      var username = await ResolveAvailableUsernameAsync(context, DefaultAdminUsername, cancellationToken);

      var adminUser = new User
      {
        Username = username,
        Email = normalizedEmail,
        PasswordHash = passwordHash,
        PasswordKey = passwordKey,
        IsActive = true,
      };

      // Koleksiyona eklemek, SaveChanges sırasında EF Core'un UserId FK'sini
      // otomatik olarak eşleştirmesini sağlar — ayrı bir insert gerekmez.
      adminUser.UserRoles.Add(new UserRole
      {
        User = adminUser,
        RoleId = adminRole.Id,
      });

      context.Users.Add(adminUser);

      await context.SaveChangesAsync(cancellationToken);
    }
    else
    {
      // Mevcut kullanıcının şifresi veya diğer alanları asla burada değiştirilmez.
      var hasAdminRole = await context.UserRoles
        .AsNoTracking()
        .AnyAsync(ur => ur.UserId == existingUser.Id && ur.RoleId == adminRole.Id, cancellationToken);

      if (!hasAdminRole)
      {
        context.UserRoles.Add(new UserRole
        {
          UserId = existingUser.Id,
          RoleId = adminRole.Id,
        });

        await context.SaveChangesAsync(cancellationToken);
      }
    }

    logger.LogInformation("Development admin user is ready: {Email}", normalizedEmail);
  }

  /// <summary>
  /// Username alanı Users tablosunda benzersizdir (IX_Users_Username). Bu development
  /// ortamında "admin" kullanıcı adı daha önce manuel bir kayıtla alınmış olabilir —
  /// bu durumda seeder'ın app startup'ını çökertmesi yerine belirleyici bir alternatif
  /// kullanıcı adı seçilir.
  /// </summary>
  private static async Task<string> ResolveAvailableUsernameAsync(
    BaseDbContext context,
    string preferredUsername,
    CancellationToken cancellationToken)
  {
    if (!await context.Users.AsNoTracking().AnyAsync(u => u.Username == preferredUsername, cancellationToken))
    {
      return preferredUsername;
    }

    for (var suffix = 2; suffix < 100; suffix++)
    {
      var candidate = $"{preferredUsername}{suffix}";

      if (!await context.Users.AsNoTracking().AnyAsync(u => u.Username == candidate, cancellationToken))
      {
        return candidate;
      }
    }

    return $"{preferredUsername}-{Guid.NewGuid():N}"[..50];
  }
}
