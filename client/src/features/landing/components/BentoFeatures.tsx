import { Activity, BarChart3, Bell, History, Settings, ShieldCheck } from "lucide-react";

const miniBars = [38, 62, 45, 80, 58, 92, 70];

export const BentoFeatures = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-neutral-50 dark:bg-black rounded-3xl my-10 border border-neutral-200 dark:border-zinc-800">
      <div className="mb-16 md:flex justify-between items-end">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-neutral-950 dark:text-white">
            Everything an admin console needs.
          </h2>
          <p className="text-lg text-neutral-600 dark:text-zinc-400">
            Analytics, identity governance, cryptographic auditing, and live observability — unified in one
            command plane.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dashboard Analytics */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <BarChart3 className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Dashboard Analytics</h3>
            <p className="text-neutral-600 dark:text-zinc-400 max-w-md">
              Live user, role, and activity metrics rendered with charts that update the instant a mutation
              happens — no page refresh required.
            </p>
          </div>
          <div className="mt-8 bg-neutral-50 dark:bg-zinc-950/70 rounded-lg p-4 flex items-end gap-1.5 h-24">
            {miniBars.map((height, index) => (
              <div
                key={index}
                style={{ height: `${height}%` }}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-500/70 to-fuchsia-400/70"
              />
            ))}
          </div>
        </div>

        {/* Granular RBAC */}
        <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <ShieldCheck className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Granular RBAC</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Admin, Editor, and Viewer enforcement down to individual buttons — disabled states always
              explain why.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-950 dark:text-white text-xs font-bold rounded-full">Admin</span>
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-xs font-medium rounded-full">Editor</span>
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-xs font-medium rounded-full">Viewer</span>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <History className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Audit Logs</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Every mutation recorded with actor, entity, and before/after diff — searchable and exportable.
            </p>
          </div>
          <div className="mt-8 font-mono text-[11px] text-neutral-500 dark:text-zinc-500 space-y-1">
            <p className="truncate">200 OK · SYNC_PERMISSIONS · Role</p>
            <p className="truncate">200 OK · DELETE · User</p>
          </div>
        </div>

        {/* Real-Time Activity */}
        <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <Activity className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Real-Time Activity</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              An event-driven feed simulates SignalR delivery today, and drops in behind the same interface
              tomorrow.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        {/* Enterprise Settings */}
        <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <Settings className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Enterprise Settings</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Profile, theme, notification, and API-key management — sensitive actions gated behind Admin
              approval.
            </p>
          </div>
          <div className="mt-8">
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-tighter">
              Admin-Gated
            </span>
          </div>
        </div>

        {/* Observability */}
        <div className="md:col-span-3 bg-white dark:bg-zinc-900/80 rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center border border-neutral-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
          <div className="md:w-1/3">
            <Bell className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Observability</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Every log entry ships with response-time, indexing, and correlation metadata — ready for an
              Elasticsearch + SignalR backend.
            </p>
          </div>
          <div className="md:w-2/3 w-full bg-neutral-50 dark:bg-zinc-950/70 rounded-lg p-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Elasticsearch Indexed</span>
            <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider">Response Time: 4ms</span>
            <span className="px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 text-[10px] font-bold uppercase tracking-wider">SignalR</span>
            <span className="px-2.5 py-1 rounded-full bg-neutral-200 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-400 text-[10px] font-mono font-semibold">corr-8f21ac0d</span>
          </div>
        </div>
      </div>
    </section>
  );
};
