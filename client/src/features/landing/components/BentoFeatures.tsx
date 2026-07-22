import { ShieldCheck, Users, History } from "lucide-react";

export const BentoFeatures = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-neutral-50 dark:bg-black rounded-[2rem] my-10 border border-neutral-200 dark:border-zinc-800">
      <div className="mb-16 md:flex justify-between items-end">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-neutral-950 dark:text-white">The Science of Security.</h2>
          <p className="text-lg text-neutral-600 dark:text-zinc-400">
            A high-fidelity framework designed for identity governance, cryptographic auditing, and granular authorization across your entire infrastructure.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-zinc-900/80 rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <Users className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Identity Lifecycle Management</h3>
            <p className="text-neutral-600 dark:text-zinc-400 max-w-md">
              Automate the provisioning, authentication, and secure decommissioning of identities across your global ecosystem from a unified command plane.
            </p>
          </div>
          <div className="mt-8 bg-neutral-50 dark:bg-zinc-950/70 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-md border border-neutral-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-zinc-800 text-neutral-950 dark:text-white flex items-center justify-center text-xs font-bold">SA</div>
                <div className="text-sm font-semibold text-neutral-950 dark:text-white">System Administrator</div>
              </div>
              <span className="px-2 py-1 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-tighter">Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 rounded-xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all border border-neutral-200 dark:border-zinc-800">
          <div>
            <ShieldCheck className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Policy-Driven RBAC</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Implement surgical authorization policies. Define and enforce role-based permissions down to the microservice and individual resource level.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-950 dark:text-white text-xs font-bold rounded-full">System Root</span>
            <span className="px-3 py-1.5 bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-xs font-medium rounded-full">Policy Analyst</span>
          </div>
        </div>

        <div className="md:col-span-3 bg-white dark:bg-zinc-900/80 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border border-neutral-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
          <div className="md:w-1/3">
            <History className="w-8 h-8 text-neutral-950 dark:text-white mb-6" />
            <h3 className="text-xl font-bold mb-2 text-neutral-950 dark:text-white">Cryptographic Audit Engine</h3>
            <p className="text-neutral-600 dark:text-zinc-400">
              Maintain an unalterable, high-throughput record of every system event. Full transparency guaranteed by cryptographically secure, immutable logs.
            </p>
          </div>
          <div className="md:w-2/3 w-full bg-neutral-50 dark:bg-zinc-950/70 rounded-lg p-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-neutral-600 dark:text-zinc-400 bg-neutral-100 dark:bg-zinc-800 font-bold uppercase tracking-widest">
                <tr>
                  <th className="p-3 rounded-tl-md">Timestamp</th>
                  <th className="p-3">Principal</th>
                  <th className="p-3">Operation</th>
                  <th className="p-3 rounded-tr-md">Resource</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  { time: "2026-04-30 14:32:01", user: "root_auth_service", action: "ROTATE_KEYS", res: "vault:secrets/primary" },
                  { time: "2026-04-30 14:31:55", user: "system_monitor", action: "AUTHORIZE_ENDPOINT", res: "api:v2/users/642" }
                ].map((log, i) => (
                  <tr key={i} className="bg-white dark:bg-zinc-900 hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors">
                    <td className="p-3 text-xs font-mono text-neutral-600 dark:text-zinc-400">{log.time}</td>
                    <td className="p-3 font-medium text-neutral-950 dark:text-white">{log.user}</td>
                    <td className="p-3 text-neutral-950 dark:text-white font-bold">{log.action}</td>
                    <td className="p-3 text-xs font-mono text-neutral-600 dark:text-zinc-400">{log.res}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
