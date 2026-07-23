import { useEffect, useMemo, useState } from "react";

type TabKey = "analytics" | "rbac" | "audit";
type Role = "Admin" | "Manager" | "User";
type Permission = "Read" | "Write" | "Export" | "Delete";

const tabs: Array<{ key: TabKey; label: string; description: string }> = [
  { key: "analytics", label: "📊 Analizler", description: "Analytics & Metrics" },
  { key: "rbac", label: "🔐 Rol Yönetimi", description: "Dynamic RBAC" },
  { key: "audit", label: "📜 Güvenlik Günlüğü", description: "Live Audit Trail" },
];

const metricData = [18, 32, 27, 48, 42, 68, 74, 91];
const permissions: Permission[] = ["Read", "Write", "Export", "Delete"];
const roles: Role[] = ["Admin", "Manager", "User"];
const logLines = [
  "200 OK /api/v1/auth :: policy=Admin.Read",
  "409 Conflict Duplicate Email :: rule=UniqueEmail",
  "201 Created Role Assigned :: principal=guest.admin",
  "200 OK /api/v1/audit :: sink=Serilog",
  "401 Unauthorized /api/v1/users/delete :: blocked=true",
];

const initialMatrix: Record<Role, Record<Permission, boolean>> = {
  Admin: { Read: true, Write: true, Export: true, Delete: true },
  Manager: { Read: true, Write: true, Export: true, Delete: false },
  User: { Read: true, Write: false, Export: false, Delete: false },
};

const AreaChart = () => {
  const points = metricData
    .map((value, index) => {
      const x = 20 + index * 48;
      const y = 116 - value;
      return `${x},${y}`;
    })
    .join(" ");

  const area = `20,130 ${points} ${20 + (metricData.length - 1) * 48},130`;

  return (
    <svg viewBox="0 0 380 150" className="h-36 w-full" role="img" aria-label="Live metrics area chart">
      <defs>
        <linearGradient id="showcaseArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 65, 100, 130].map((y) => (
        <line key={y} x1="18" x2="356" y1={y} y2={y} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
      ))}
      <polygon points={area} fill="url(#showcaseArea)" />
      <polyline points={points} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {metricData.map((value, index) => (
        <circle key={`${value}-${index}`} cx={20 + index * 48} cy={116 - value} r="4" fill="#ec4899" />
      ))}
    </svg>
  );
};

export const InteractiveShowcase = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("analytics");
  const [matrix, setMatrix] = useState(initialMatrix);
  const [visibleLogCount, setVisibleLogCount] = useState(3);

  useEffect(() => {
    if (activeTab !== "audit") return;

    const interval = window.setInterval(() => {
      setVisibleLogCount((current) => (current >= logLines.length ? 3 : current + 1));
    }, 1400);

    return () => window.clearInterval(interval);
  }, [activeTab]);

  const activePermissions = useMemo(() => {
    return Object.values(matrix).reduce(
      (total, rolePermissions) => total + Object.values(rolePermissions).filter(Boolean).length,
      0,
    );
  }, [matrix]);

  const togglePermission = (role: Role, permission: Permission) => {
    setMatrix((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [permission]: !current[role][permission],
      },
    }));
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/75 text-left shadow-2xl shadow-zinc-900/10 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/30">
      <div className="flex items-center gap-3 border-b border-zinc-200/70 bg-zinc-50/80 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          myadmin-control-center.v1
        </span>
      </div>

      <div className="grid border-b border-zinc-200/70 bg-white/60 dark:border-zinc-800 dark:bg-black/20 md:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-left transition ${
              activeTab === tab.key
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            <span className="block text-sm font-bold">{tab.label}</span>
            <span className="block text-xs opacity-70">{tab.description}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[320px] p-5">
        {activeTab === "analytics" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Total Users", "14,208", "+12.4%"],
                ["Active Roles", "856", `${activePermissions} grants`],
                ["Requests", "1.2M", "99.99% OK"],
              ].map(([label, value, meta]) => (
                <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">{value}</p>
                  <p className="text-xs font-medium text-emerald-500">{meta}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
              <AreaChart />
            </div>
          </div>
        )}

        {activeTab === "rbac" && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-5 bg-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-900">
              <div className="px-4 py-3">Role</div>
              {permissions.map((permission) => (
                <div key={permission} className="px-4 py-3 text-center">
                  {permission}
                </div>
              ))}
            </div>
            {roles.map((role) => (
              <div key={role} className="grid grid-cols-5 items-center border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/50">
                <div className="px-4 py-4 text-sm font-bold text-zinc-950 dark:text-white">{role}</div>
                {permissions.map((permission) => (
                  <div key={permission} className="flex justify-center px-4 py-4">
                    <button
                      type="button"
                      onClick={() => togglePermission(role, permission)}
                      className={`h-6 w-11 rounded-full p-1 transition ${
                        matrix[role][permission] ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-800"
                      }`}
                      aria-pressed={matrix[role][permission]}
                      aria-label={`${role} ${permission}`}
                    >
                      <span
                        className={`block h-4 w-4 rounded-full bg-white shadow transition ${
                          matrix[role][permission] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "audit" && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-200 shadow-inner">
            {logLines.slice(0, visibleLogCount).map((line, index) => (
              <div key={line} className="flex gap-3 border-b border-white/5 py-2 last:border-b-0">
                <span className="text-zinc-500">#{String(index + 1).padStart(2, "0")}</span>
                <span className={line.startsWith("409") ? "text-amber-300" : line.startsWith("401") ? "text-red-300" : "text-emerald-300"}>
                  {line}
                </span>
              </div>
            ))}
            <div className="mt-3 h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
          </div>
        )}
      </div>
    </div>
  );
};
