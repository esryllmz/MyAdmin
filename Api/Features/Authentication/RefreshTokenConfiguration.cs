using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Features.Authentication;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
  public void Configure(EntityTypeBuilder<RefreshToken> builder)
  {
    builder.ToTable("RefreshTokens");

    builder.HasKey(rt => rt.Id);

    builder.Property(rt => rt.Id)
      .HasColumnName("Id")
      .IsRequired();

    builder.Property(rt => rt.CreatedDate)
      .HasColumnName("CreatedDate")
      .IsRequired();

    builder.Property(rt => rt.UpdatedDate)
      .HasColumnName("UpdatedDate")
      .IsRequired(false);

    builder.Property(rt => rt.UserId)
      .IsRequired();

    builder.Property(rt => rt.FamilyId)
      .IsRequired();

    builder.Property(rt => rt.TokenHash)
      .HasMaxLength(64)
      .IsFixedLength()
      .IsRequired();

    builder.Property(rt => rt.ExpiresAt)
      .IsRequired();

    builder.Property(rt => rt.AbsoluteExpiresAt)
      .IsRequired();

    builder.Property(rt => rt.RevokedAt)
      .IsRequired(false);

    builder.Property(rt => rt.ReplacedByTokenId)
      .IsRequired(false);

    builder.Property(rt => rt.CreatedByIp)
      .HasMaxLength(45)
      .IsRequired(false);

    builder.Property(rt => rt.RevokedByIp)
      .HasMaxLength(45)
      .IsRequired(false);

    builder.Property(rt => rt.ReasonRevoked)
      .HasMaxLength(50)
      .IsRequired(false);

    builder.HasIndex(rt => rt.TokenHash)
      .IsUnique();

    builder.HasIndex(rt => new { rt.UserId, rt.FamilyId });

    builder.HasOne(rt => rt.User)
      .WithMany(u => u.RefreshTokens)
      .HasForeignKey(rt => rt.UserId)
      .OnDelete(DeleteBehavior.Cascade);

    // Self-referencing FK: must be NoAction. SQL Server rejects Cascade here because it would
    // create a second cascade path to RefreshTokens alongside the UserId FK above (multiple
    // cascade paths are not allowed).
    builder.HasOne(rt => rt.ReplacedByToken)
      .WithMany()
      .HasForeignKey(rt => rt.ReplacedByTokenId)
      .OnDelete(DeleteBehavior.NoAction);
  }
}
