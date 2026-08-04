import { useCurrentRole } from "./useCurrentRole";

export type MutationAction =
  | "inviteUser"
  | "toggleUserStatus"
  | "deleteUser"
  | "syncUserRole"
  | "newRole"
  | "syncRolePermissions"
  | "manageApiKeys"
  | "viewSensitiveData"
  | "deleteTeam"
  | "assignTeamOwner";

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
  deleteTeam: "admin",
  assignTeamOwner: "admin",
};

const REASON: Record<RequiredLevel, string> = {
  editor: "This action requires Editor or Admin access.",
  admin: "This action requires Admin access.",
};

export interface MutationPermission {
  allowed: boolean;
  reason?: string;
}

/**
 * View/route-level features — distinct from MutationAction above, which gates individual
 * buttons. This gates entire pages/routes/sections. "any" = every authenticated role
 * including Viewer; "editor" = Editor or Admin; "admin" = Admin only.
 *
 * Kept in sync with the backend's [Authorize(Roles = ...)] attributes — see:
 *  - Api/Features/Users/UsersController.cs        (GetAll → Admin)
 *  - Api/Features/Roles/RolesController.cs         (class-level → Admin)
 *  - Api/Features/Permissions/PermissionsController.cs (class-level → Admin)
 *  - Api/Features/Activities/ActivitiesController.cs   (GetAll → Admin, "me" → any)
 * A frontend restriction here without a matching backend restriction is not a security
 * control — the backend attribute is what actually protects the data.
 */
export type ViewFeature =
  | "personalDashboard"
  | "systemDashboard"
  | "ownActivity"
  | "globalActivity"
  | "reports"
  | "securityReports"
  | "permissionReports"
  | "exportReports"
  | "scheduledReports"
  | "profile"
  | "account"
  | "security"
  | "appearance"
  | "ownNotifications"
  | "ownAccess"
  | "myTeams"
  | "apiKeys"
  | "personalAudit"
  | "users"
  | "roles"
  | "permissions"
  | "teams"
  | "integrations"
  | "securityCenter"
  | "systemHealth";

type ViewLevel = "any" | "editor" | "admin";

const VIEW_ACCESS: Record<ViewFeature, ViewLevel> = {
  personalDashboard: "any",
  systemDashboard: "editor",
  ownActivity: "any",
  globalActivity: "admin",
  // Viewer no longer gets a Reports module of its own (My Activity is the single
  // personal activity surface) — Editor/Admin keep Reports unchanged.
  reports: "editor",
  securityReports: "admin",
  permissionReports: "admin",
  exportReports: "admin",
  scheduledReports: "admin",
  profile: "any",
  account: "any",
  security: "any",
  appearance: "any",
  ownNotifications: "any",
  ownAccess: "any",
  myTeams: "any",
  // API Keys is Admin-only — Editor's mandate is Viewer/Team operations, not credential
  // management.
  apiKeys: "admin",
  // Settings > My Activity is redundant for every role that has its own dedicated activity
  // page: Viewer uses /activities (My Activity), Editor uses /activities (Operations Activity).
  // Only Admin still lacks a dedicated personal-activity page, so only Admin keeps this tab.
  personalAudit: "admin",
  users: "editor",
  roles: "admin",
  permissions: "admin",
  teams: "editor",
  integrations: "admin",
  securityCenter: "admin",
  systemHealth: "admin",
};

/**
 * /team, /roles ve /settings sayfalarındaki mutasyon butonları ve route guard'ları için tek
 * yetki kaynağı. Roller sabittir (Admin/Editor/Viewer, bkz. Api/Data/SeedData.cs) — yeni bir
 * aksiyon eklenirse yalnızca ACTION_REQUIREMENT/VIEW_ACCESS'e satır eklenir.
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

  const canView = (feature: ViewFeature): boolean => {
    const level = VIEW_ACCESS[feature];
    if (level === "any") return true;
    if (level === "editor") return isAdmin || isEditor;
    return isAdmin;
  };

  return { role, isAdmin, isEditor, isViewer, can, canView };
};

export const useCanMutate = (action: MutationAction): MutationPermission => useRolePermissions().can(action);

export const useCanView = (feature: ViewFeature): boolean => useRolePermissions().canView(feature);
