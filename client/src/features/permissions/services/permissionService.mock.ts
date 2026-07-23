import type { PermissionResponseDto } from "../types/permissionTypes";

/**
 * Api/Data/SeedData.cs ile birebir aynı Guid'ler — sistemdeki sabit izin katalogu.
 * Roller bu izinlerin bir alt kümesini referans alır (bkz. roleService.mock.ts).
 */
export const mockPermissions: PermissionResponseDto[] = [
  { id: "f1a18277-3e1e-4058-b593-577e485933a1", name: "users.view", description: "Görüntüleme yetkisi." },
  { id: "f1a18277-3e1e-4058-b593-577e485933a2", name: "users.create", description: "Ekleme yetkisi." },
  { id: "f1a18277-3e1e-4058-b593-577e485933a3", name: "users.edit", description: "Düzenleme yetkisi." },
  { id: "f1a18277-3e1e-4058-b593-577e485933a4", name: "users.delete", description: "Silme yetkisi." },
  { id: "f1a18277-3e1e-4058-b593-577e485933b1", name: "roles.view", description: "Rolleri görme." },
  { id: "f1a18277-3e1e-4058-b593-577e485933b2", name: "roles.create", description: "Rol ekleme." },
  { id: "f1a18277-3e1e-4058-b593-577e485933b3", name: "roles.edit", description: "Rol düzenleme." },
  { id: "f1a18277-3e1e-4058-b593-577e485933b4", name: "roles.delete", description: "Rol silme." },
  { id: "f1a18277-3e1e-4058-b593-577e485933c1", name: "activities.view", description: "Logları görme." },
];

export const getMockPermissions = (): PermissionResponseDto[] => mockPermissions.map((permission) => ({ ...permission }));
