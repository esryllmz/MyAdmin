import { mockPermissions } from "@/features/permissions/services/permissionService.mock";
import type { CreateRoleRequest, RoleResponseDto } from "../types/roleTypes";

/**
 * Api/Data/SeedData.cs ile birebir aynı Guid'ler kullanılıyor — demo modu gerçek
 * seed verisinin sadık bir yansıması olsun diye (gerçek girişe geçildiğinde de tutarlı kalır).
 *
 * Modül seviyesinde mutable liste — yeni rol ekleme ve izin senkronizasyonu oturum
 * boyunca kalıcı olsun diye (bkz. userService.mock.ts / notificationService.mock.ts).
 */
const now = "2026-05-01T00:00:00.000Z";

const byNames = (names: string[]) => mockPermissions.filter((permission) => names.includes(permission.name));

let mockRoles: RoleResponseDto[] = [
  {
    id: "d6088277-3e1e-4058-8593-577e4859339a",
    name: "Admin",
    label: "Sistem Yöneticisi",
    description: "Tüm sistem üzerinde tam yetki.",
    createdDate: now,
    updatedDate: null,
    permissions: byNames([
      "users.view", "users.create", "users.edit", "users.delete",
      "roles.view", "roles.create", "roles.edit", "roles.delete",
      "activities.view",
    ]),
  },
  {
    id: "c4188277-3e1e-4058-b593-577e4859339b",
    name: "Editor",
    label: "Editör",
    description: "İçerik yönetimi ve kullanıcı görüntüleme yetkisi.",
    createdDate: now,
    updatedDate: null,
    permissions: byNames(["users.view", "users.edit"]),
  },
  {
    id: "b1288277-3e1e-4058-b593-577e4859339c",
    name: "Viewer",
    label: "Gözlemci",
    description: "Sadece görüntüleme yetkisi olan kısıtlı rol.",
    createdDate: now,
    updatedDate: null,
    permissions: byNames(["users.view"]),
  },
];

// userService.mock.ts'teki hazır demo kullanıcılarını rollere atamak için kullanılan sabit referanslar.
export const mockAdminRole = mockRoles[0];
export const mockEditorRole = mockRoles[1];
export const mockViewerRole = mockRoles[2];

export const getMockRoles = (): RoleResponseDto[] =>
  mockRoles.map((role) => ({ ...role, permissions: [...role.permissions] }));

export const addMockRole = (request: CreateRoleRequest): RoleResponseDto => {
  const created = new Date().toISOString();
  const newRole: RoleResponseDto = {
    id: `mock-role-${crypto.randomUUID().slice(0, 8)}`,
    name: request.name,
    description: request.description,
    label: request.label,
    createdDate: created,
    updatedDate: null,
    permissions: [],
  };

  mockRoles = [...mockRoles, newRole];
  return newRole;
};

export const syncMockRolePermissions = (roleId: string, permissionIds: string[]): void => {
  const selectedPermissions = mockPermissions.filter((permission) => permissionIds.includes(permission.id));
  const updatedAt = new Date().toISOString();

  mockRoles = mockRoles.map((role) =>
    role.id === roleId ? { ...role, permissions: selectedPermissions, updatedDate: updatedAt } : role
  );
};
