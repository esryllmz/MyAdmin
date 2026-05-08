using Api.Features.Permissions;
using Api.Features.RolePermissions;
using Api.Features.Roles;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public static class SeedData
{
  public static void Seed(ModelBuilder modelBuilder)
  {
    var adminRoleId = Guid.Parse("d6088277-3e1e-4058-8593-577e4859339a");
    var editorRoleId = Guid.Parse("c4188277-3e1e-4058-b593-577e4859339b");
    var viewerRoleId = Guid.Parse("b1288277-3e1e-4058-b593-577e4859339c");

    modelBuilder.Entity<Role>().HasData(
        new { Id = adminRoleId, Name = "Admin", Label = "Sistem Yöneticisi", Description = "Tüm sistem üzerinde tam yetki.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = editorRoleId, Name = "Editor", Label = "Editör", Description = "İçerik yönetimi ve kullanıcı görüntüleme yetkisi.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = viewerRoleId, Name = "Viewer", Label = "Gözlemci", Description = "Sadece görüntüleme yetkisi olan kısıtlı rol.", CreatedDate = new DateTime(2026, 5, 1) }
    );

    var pUsersView = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933a1");
    var pUsersCreate = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933a2");
    var pUsersEdit = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933a3");
    var pUsersDelete = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933a4");
    var pRolesView = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933b1");
    var pRolesCreate = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933b2");
    var pRolesEdit = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933b3");
    var pRolesDelete = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933b4");
    var pActivitiesView = Guid.Parse("f1a18277-3e1e-4058-b593-577e485933c1");

    modelBuilder.Entity<Permission>().HasData(
        new { Id = pUsersView, Name = "users.view", Description = "Görüntüleme yetkisi.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pUsersCreate, Name = "users.create", Description = "Ekleme yetkisi.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pUsersEdit, Name = "users.edit", Description = "Düzenleme yetkisi.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pUsersDelete, Name = "users.delete", Description = "Silme yetkisi.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pRolesView, Name = "roles.view", Description = "Rolleri görme.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pRolesCreate, Name = "roles.create", Description = "Rol ekleme.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pRolesEdit, Name = "roles.edit", Description = "Rol düzenleme.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pRolesDelete, Name = "roles.delete", Description = "Rol silme.", CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = pActivitiesView, Name = "activities.view", Description = "Logları görme.", CreatedDate = new DateTime(2026, 5, 1) }
    );


    modelBuilder.Entity<RolePermission>().HasData(
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000001"), RoleId = adminRoleId, PermissionId = pUsersView, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000002"), RoleId = adminRoleId, PermissionId = pUsersCreate, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000003"), RoleId = adminRoleId, PermissionId = pUsersEdit, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000004"), RoleId = adminRoleId, PermissionId = pUsersDelete, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000005"), RoleId = adminRoleId, PermissionId = pRolesView, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000006"), RoleId = adminRoleId, PermissionId = pRolesCreate, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000007"), RoleId = adminRoleId, PermissionId = pRolesEdit, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000008"), RoleId = adminRoleId, PermissionId = pRolesDelete, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000009"), RoleId = adminRoleId, PermissionId = pActivitiesView, CreatedDate = new DateTime(2026, 5, 1) },

        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000010"), RoleId = editorRoleId, PermissionId = pUsersView, CreatedDate = new DateTime(2026, 5, 1) },
        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000011"), RoleId = editorRoleId, PermissionId = pUsersEdit, CreatedDate = new DateTime(2026, 5, 1) },

        new { Id = Guid.Parse("00000000-0000-0000-0000-000000000012"), RoleId = viewerRoleId, PermissionId = pUsersView, CreatedDate = new DateTime(2026, 5, 1) }
    );
  }
}
