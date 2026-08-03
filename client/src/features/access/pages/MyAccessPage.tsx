import { useSelector } from "react-redux";
import { Check, X } from "lucide-react";
import type { RootState } from "@/core/store/store";
import { useCurrentRole } from "@/core/hooks/useCurrentRole";

interface AccessCapability {
  you_can: string[];
  restricted: string[];
  scope: string;
}

/**
 * Role-scoped "what can I do" summary — no permission matrices, no other roles' capabilities,
 * no internal claims/policy detail. Just this account's own access, described in plain language.
 */
const ACCESS_BY_ROLE: Record<string, AccessCapability> = {
  Viewer: {
    scope: "Personal workspace",
    you_can: [
      "View your personal dashboard",
      "Review your own activity",
      "Manage your profile",
      "Manage your appearance preferences",
      "Review your active sessions",
      "Manage your own notifications",
    ],
    restricted: [
      "User management",
      "Role management",
      "Permission management",
      "Security reports",
      "API key management",
      "System configuration",
      "System audit logs",
    ],
  },
  Editor: {
    scope: "Team workspace",
    you_can: [
      "View your personal dashboard",
      "Review your own activity and reports",
      "Manage your profile",
      "Manage your appearance preferences",
      "Review your active sessions",
      "Manage your own notifications",
      "Invite and manage users",
      "Manage teams",
    ],
    restricted: [
      "Role management",
      "Permission management",
      "Security reports",
      "System configuration",
      "System audit logs",
    ],
  },
  Admin: {
    scope: "Full workspace administration",
    you_can: [
      "View the system-wide dashboard",
      "Manage users, roles, and permissions",
      "Manage teams and integrations",
      "Review global activity and security reports",
      "Manage your profile and preferences",
    ],
    restricted: [],
  },
};

const MyAccessPage = () => {
  const role = useCurrentRole();
  const user = useSelector((state: RootState) => state.auth.user);
  const roleLabel = user?.roles?.[0]?.label ?? role ?? "—";
  const access = (role && ACCESS_BY_ROLE[role]) || ACCESS_BY_ROLE.Viewer;

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">My Access</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          What your account can and can't do in this workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
            Role
          </p>
          <p className="text-xl font-bold text-on-surface dark:text-dark-on-surface">{roleLabel}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
            Access Scope
          </p>
          <p className="text-xl font-bold text-on-surface dark:text-dark-on-surface">{access.scope}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
            Account Status
          </p>
          <p
            className={`text-xl font-bold ${user?.isActive ? "text-success" : "text-error"}`}
          >
            {user?.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-6">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface mb-4">You Can</h3>
          <ul className="space-y-3">
            {access.you_can.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-on-surface dark:text-dark-on-surface">
                <Check size={16} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-6">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface mb-4">Restricted</h3>
          {access.restricted.length === 0 ? (
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              Your role has no restricted areas in this workspace.
            </p>
          ) : (
            <ul className="space-y-3">
              {access.restricted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant"
                >
                  <X size={16} className="text-error mt-0.5 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccessPage;
