import type { PermissionResponseDto } from "../types/permissionTypes";

const GROUP_LABELS: Record<string, string> = {
  users: "Kullanıcı Yönetimi",
  roles: "Rol Yönetimi",
  activities: "Aktivite Kayıtları",
};

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: PermissionResponseDto[];
}

export const groupPermissionsByResource = (permissions: PermissionResponseDto[]): PermissionGroup[] => {
  const groups = new Map<string, PermissionResponseDto[]>();

  permissions.forEach((permission) => {
    const key = permission.name.split(".")[0] ?? permission.name;
    groups.set(key, [...(groups.get(key) ?? []), permission]);
  });

  return Array.from(groups.entries()).map(([key, groupedPermissions]) => ({
    key,
    label: GROUP_LABELS[key] ?? key,
    permissions: groupedPermissions,
  }));
};
