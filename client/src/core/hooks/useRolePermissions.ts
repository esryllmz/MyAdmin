import { useCurrentRole } from "./useCurrentRole";

export type MutationAction =
  | "inviteUser"
  | "toggleUserStatus"
  | "deleteUser"
  | "syncUserRole"
  | "newRole"
  | "syncRolePermissions"
  | "manageApiKeys"
  | "viewSensitiveData";

type RequiredLevel = "editor" | "admin";

const ACTION_REQUIREMENT: Record<MutationAction, RequiredLevel> = {
  inviteUser: "editor",
  toggleUserStatus: "editor",
  deleteUser: "admin",
  syncUserRole: "admin",
  newRole: "admin",
  syncRolePermissions: "admin",
  manageApiKeys: "admin",
  viewSensitiveData: "admin",
};

const REASON: Record<RequiredLevel, string> = {
  editor: "Bu işlem için Editor veya Admin yetkisi gereklidir.",
  admin: "Bu işlem için Admin yetkisi gereklidir.",
};

export interface MutationPermission {
  allowed: boolean;
  reason?: string;
}

/**
 * /team, /roles ve /settings sayfalarındaki mutasyon butonları için tek yetki
 * kaynağı. Roller sabittir (Admin/Editor/Viewer, bkz. Api/Data/SeedData.cs) —
 * yeni bir aksiyon eklenirse yalnızca ACTION_REQUIREMENT'a satır eklenir.
 */
export const useRolePermissions = () => {
  const role = useCurrentRole();
  const isAdmin = role === "Admin";
  const isEditor = role === "Editor";
  const isViewer = role === "Viewer";

  const can = (action: MutationAction): MutationPermission => {
    const requirement = ACTION_REQUIREMENT[action];
    const allowed = requirement === "editor" ? isAdmin || isEditor : isAdmin;
    return allowed ? { allowed: true } : { allowed: false, reason: REASON[requirement] };
  };

  return { role, isAdmin, isEditor, isViewer, can };
};

export const useCanMutate = (action: MutationAction): MutationPermission => useRolePermissions().can(action);
