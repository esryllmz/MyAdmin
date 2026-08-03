using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Api.Features.Teams;

public class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
  public void Configure(EntityTypeBuilder<TeamMember> builder)
  {
    builder.ToTable("TeamMembers");

    builder.HasKey(tm => tm.Id);

    builder.Property(tm => tm.Id).HasColumnName("Id").IsRequired();
    builder.Property(tm => tm.CreatedDate).HasColumnName("CreatedDate").IsRequired();
    builder.Property(tm => tm.UpdatedDate).HasColumnName("UpdatedDate").IsRequired(false);

    builder.Property(tm => tm.MembershipRole).HasMaxLength(20).IsRequired();
    builder.Property(tm => tm.IsActive).HasDefaultValue(true).IsRequired();

    // One membership row per (Team, User) — re-adding a removed member updates the existing
    // row instead of inserting a duplicate.
    builder.HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();
    builder.HasIndex(tm => tm.IsActive);

    builder.HasOne(tm => tm.Team)
      .WithMany(t => t.Members)
      .HasForeignKey(tm => tm.TeamId)
      .OnDelete(DeleteBehavior.Cascade);

    // Both user-referencing FKs are Restrict so SQL Server never has to resolve more than one
    // cascade path into this table (the Team -> TeamMember edge above is the only cascade edge).
    builder.HasOne(tm => tm.User)
      .WithMany()
      .HasForeignKey(tm => tm.UserId)
      .OnDelete(DeleteBehavior.Restrict);

    builder.HasOne(tm => tm.AddedByUser)
      .WithMany()
      .HasForeignKey(tm => tm.AddedByUserId)
      .OnDelete(DeleteBehavior.Restrict);
  }
}
