using Api.Core.Entities;
using Api.Features.Activities;
using Api.Features.Authentication;
using Api.Features.Notifications;
using Api.Features.UserRoles;
using System.Diagnostics.CodeAnalysis;

namespace Api.Features.Users;

public class User : Entity<Guid>
{
  [SetsRequiredMembers]
  public User()
  {
    UserRoles = new HashSet<UserRole>();
    Notifications = new HashSet<Notification>();
    Activities = new HashSet<Activity>();
    RefreshTokens = new HashSet<RefreshToken>();

    Username = default!;
    Email = default!;
    PasswordHash = default!;
  }

  public required string Username { get; set; }
  public required string Email { get; set; }
  public required string PasswordHash { get; set; }

  /// <summary>
  /// Non-null only for accounts still on the pre-P0 HMACSHA512 scheme (the legacy HMAC key).
  /// Null means PasswordHash is in the current PasswordHasher&lt;User&gt; format. Cleared the
  /// first time a legacy account logs in successfully or changes its password.
  /// </summary>
  public string? PasswordKey { get; set; }

  public string? ProfileImageUrl { get; set; }
  public string? Bio { get; set; }
  public bool IsActive { get; set; } = true;

  // Navigation properties
  public virtual ICollection<UserRole> UserRoles { get; set; }
  public virtual ICollection<Notification> Notifications { get; set; }
  public virtual ICollection<Activity> Activities { get; set; }
  public virtual ICollection<RefreshToken> RefreshTokens { get; set; }
}
