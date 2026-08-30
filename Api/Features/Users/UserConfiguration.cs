using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Features.Users;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
  public void Configure(EntityTypeBuilder<User> builder)
  {
    builder.ToTable("Users");

    builder.HasKey(u => u.Id);

    builder.Property(u => u.Id)
      .HasColumnName("Id")
      .IsRequired();

    builder.Property(u => u.CreatedDate)
      .HasColumnName("CreatedDate")
      .IsRequired();

    builder.Property(u => u.UpdatedDate)
      .HasColumnName("UpdatedDate")
      .IsRequired(false);

    builder.Property(u => u.Username)
      .HasMaxLength(50)
      .IsRequired();

    builder.Property(u => u.Email)
      .HasMaxLength(150)
      .IsRequired();

    builder.Property(u => u.PasswordHash)
      .IsRequired();

    // Nullable during the P0 migration window: non-null means this row is still on the legacy
    // HMACSHA512 scheme. See User.PasswordKey and PasswordVerificationOutcome.LegacyUpgradeNeeded.
    builder.Property(u => u.PasswordKey)
      .IsRequired(false);

    builder.Property(u => u.ProfileImageUrl)
      .HasMaxLength(500)
      .IsRequired(false);

    builder.Property(u => u.Bio)
      .HasMaxLength(1000)
      .IsRequired(false);

    builder.Property(u => u.IsActive)
      .HasDefaultValue(true)
      .IsRequired();

    builder.HasIndex(u => u.Username)
      .IsUnique();

    builder.HasIndex(u => u.Email)
      .IsUnique();
  }
}
