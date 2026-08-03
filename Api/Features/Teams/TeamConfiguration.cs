using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Features.Teams;

public class TeamConfiguration : IEntityTypeConfiguration<Team>
{
  public void Configure(EntityTypeBuilder<Team> builder)
  {
    builder.ToTable("Teams");

    builder.HasKey(t => t.Id);

    builder.Property(t => t.Id).HasColumnName("Id").IsRequired();
    builder.Property(t => t.CreatedDate).HasColumnName("CreatedDate").IsRequired();
    builder.Property(t => t.UpdatedDate).HasColumnName("UpdatedDate").IsRequired(false);

    builder.Property(t => t.Name).HasMaxLength(100).IsRequired();
    builder.Property(t => t.Description).HasMaxLength(500).IsRequired(false);

    builder.Property(t => t.IsActive).HasDefaultValue(true).IsRequired();

    builder.HasIndex(t => t.Name);
    builder.HasIndex(t => t.IsActive);

    // Restrict, not Cascade: deleting the creating user must never silently delete the teams
    // they created — that's an irreversible data-loss path with no confirmation in front of it.
    builder.HasOne(t => t.CreatedByUser)
      .WithMany()
      .HasForeignKey(t => t.CreatedByUserId)
      .OnDelete(DeleteBehavior.Restrict);
  }
}
