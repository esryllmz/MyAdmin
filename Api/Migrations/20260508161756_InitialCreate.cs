using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RefreshTokenExpiration = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Activities_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "INFO"),
                    LinkUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Permissions",
                columns: new[] { "Id", "CreatedDate", "Description", "Name", "UpdatedDate" },
                values: new object[,]
                {
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933a1"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Görüntüleme yetkisi.", "users.view", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933a2"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ekleme yetkisi.", "users.create", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933a3"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Düzenleme yetkisi.", "users.edit", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933a4"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Silme yetkisi.", "users.delete", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933b1"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rolleri görme.", "roles.view", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933b2"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rol ekleme.", "roles.create", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933b3"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rol düzenleme.", "roles.edit", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933b4"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Rol silme.", "roles.delete", null },
                    { new Guid("f1a18277-3e1e-4058-b593-577e485933c1"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Logları görme.", "activities.view", null }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "CreatedDate", "Description", "Label", "Name", "UpdatedDate" },
                values: new object[,]
                {
                    { new Guid("b1288277-3e1e-4058-b593-577e4859339c"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sadece görüntüleme yetkisi olan kısıtlı rol.", "Gözlemci", "Viewer", null },
                    { new Guid("c4188277-3e1e-4058-b593-577e4859339b"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "İçerik yönetimi ve kullanıcı görüntüleme yetkisi.", "Editör", "Editor", null },
                    { new Guid("d6088277-3e1e-4058-8593-577e4859339a"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Tüm sistem üzerinde tam yetki.", "Sistem Yöneticisi", "Admin", null }
                });

            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "Id", "CreatedDate", "PermissionId", "RoleId", "UpdatedDate" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a1"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000002"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a2"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000003"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a3"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000004"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a4"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000005"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933b1"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000006"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933b2"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000007"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933b3"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000008"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933b4"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000009"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933c1"), new Guid("d6088277-3e1e-4058-8593-577e4859339a"), null },
                    { new Guid("00000000-0000-0000-0000-000000000010"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a1"), new Guid("c4188277-3e1e-4058-b593-577e4859339b"), null },
                    { new Guid("00000000-0000-0000-0000-000000000011"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a3"), new Guid("c4188277-3e1e-4058-b593-577e4859339b"), null },
                    { new Guid("00000000-0000-0000-0000-000000000012"), new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("f1a18277-3e1e-4058-b593-577e485933a1"), new Guid("b1288277-3e1e-4058-b593-577e4859339c"), null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_UserId",
                table: "Activities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Name",
                table: "Permissions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionId",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleId",
                table: "UserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_UserId_RoleId",
                table: "UserRoles",
                columns: new[] { "UserId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
