/**
 * Static, presentation-only content for the public Landing page.
 *
 * Nothing in this file (or anything that imports it) may call a hook, service, or query that
 * touches the API — Landing is public and must render with zero network requests and zero
 * dependency on auth state beyond the single `isAuthenticated` read used for the "Open Console"
 * CTA. If a future edit needs "real" numbers here, wire a dedicated public/anonymous endpoint —
 * never reuse useUsers/useRoles/useActivities/usePermissions (those are gated behind auth and
 * belong to the dashboard only).
 */

export const HERO_PREVIEW_STATS = [
  { label: "Active Sessions", value: "12" },
  { label: "Pending Reviews", value: "3" },
  { label: "System Health", value: "98.7%" },
] as const;

export const HERO_PREVIEW_ROWS = [
  { label: "Role sync completed", meta: "2 min ago", tone: "ok" as const },
  { label: "New user invited", meta: "18 min ago", tone: "ok" as const },
  { label: "Failed login attempt", meta: "1 hr ago", tone: "warn" as const },
];

export const IDENTITY_ACCESS_ROWS = [
  { label: "Users", value: "Read" },
  { label: "Roles", value: "Write" },
  { label: "Access reviews", value: "Admin" },
];

export const REPORTING_AUDIT_EVENTS = [
  { label: "Permission changed", meta: "4 min ago" },
  { label: "Report exported", meta: "1 hr ago" },
  { label: "Security event logged", meta: "3 hr ago" },
];

export const SYSTEM_OPERATIONS_ROWS = [
  { label: "Notifications", status: "On" },
  { label: "API keys", status: "2 active" },
  { label: "Session limit", status: "Configured" },
];

export const PRODUCT_SCREENS = [
  { id: "dashboard", title: "Dashboard", description: "System health, recent activity, and pending reviews at a glance." },
  { id: "reports", title: "Reports", description: "Filterable report views with export status and history." },
  { id: "roles", title: "Roles", description: "Role list with a permission matrix and immediate scope preview." },
  { id: "settings", title: "Settings", description: "Profile, security, notifications, and integrations by module." },
] as const;

export const DASHBOARD_PREVIEW = {
  stats: [
    { label: "Health", value: "98.7%" },
    { label: "Active", value: "12" },
    { label: "Pending", value: "3" },
  ],
  activity: ["Role sync completed", "New user invited", "Pending access review"],
};

export const REPORTS_PREVIEW = {
  chips: ["This week", "Activity", "Security"],
  barWidths: [90, 74, 60, 45],
};

export const ROLES_PREVIEW = {
  roles: ["Admin", "Editor", "Viewer"],
  matrixCellCount: 12,
};

export const SETTINGS_PREVIEW = {
  tabs: ["Profile", "Security", "API"],
  rows: [
    { label: "Two-factor authentication", on: true },
    { label: "Session timeout", on: false },
    { label: "Email notifications", on: true },
  ],
};

export const PROCESS_STEPS = [
  { key: "invite", label: "Invite" },
  { key: "assign", label: "Assign" },
  { key: "review", label: "Review" },
  { key: "monitor", label: "Monitor" },
  { key: "audit", label: "Audit" },
] as const;

export const SECURITY_POINTS = [
  "Role-based access control enforced down to individual mutations",
  "Permission review, per role and per user",
  "Session visibility — active sessions are listed and revocable",
  "Activity records for every meaningful change, with actor and entity",
  "API key lifecycle — issued, used, expired, revoked",
  "Sensitive actions are restricted to admin-only routes",
];

export const SECURITY_EVENTS = [
  { label: "Role permissions synced", role: "Editor", tone: "ok" as const },
  { label: "3 failed login attempts", role: "unknown user", tone: "warn" as const },
  { label: "API key regenerated", role: "Admin", tone: "ok" as const },
  { label: "Session revoked", role: "Viewer", tone: "ok" as const },
];

export const DOCUMENTATION_TOPICS = [
  { key: "getting-started", title: "Getting started", description: "Sign in, orient yourself, and find your way around the console." },
  { key: "role-model", title: "Role model", description: "How Admin, Editor, and Viewer scope what a user can see and do." },
  { key: "reports", title: "Reports", description: "Filter, export, and schedule activity, security, and permission reports." },
  { key: "settings", title: "Settings", description: "Profile, security, notifications, and integration configuration." },
  { key: "api-access", title: "API access", description: "Issuing, using, and revoking API keys for integrations." },
];
