import { useState } from "react";
import { Database, Globe, Layers, Radio, Server } from "lucide-react";

type NodeKey = "client" | "gateway" | "api" | "data" | "realtime";

interface ArchitectureNode {
  key: NodeKey;
  label: string;
  detail: string;
  icon: typeof Server;
}

const FLOW_NODES: ArchitectureNode[] = [
  { key: "client", label: "React 19 + TypeScript", detail: "Vite · Redux Toolkit · TanStack Query", icon: Globe },
  { key: "gateway", label: "API Gateway", detail: "JWT + refresh-token auth", icon: Layers },
  { key: "api", label: ".NET 10 Web API", detail: "Feature-folder mimarisi", icon: Server },
  { key: "data", label: "SQL Server", detail: "EF Core · persistence", icon: Database },
];

export const ArchitectureShowcase = () => {
  const [activeNode, setActiveNode] = useState<NodeKey | null>(null);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-12 max-w-xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-neutral-950 dark:text-white">
          System Architecture.
        </h2>
        <p className="text-lg text-neutral-600 dark:text-zinc-400">
          A request travels from the React client through the gateway to the .NET 10 API, backed by SQL
          Server via EF Core. A frontend event bus simulates real-time delivery today, using a
          SignalR-shaped contract ready for a production hub.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 md:p-10">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center md:gap-0">
          {FLOW_NODES.map((node, index) => {
            const Icon = node.icon;
            const isActive = activeNode === node.key;
            return (
              <div key={node.key} className="flex flex-1 items-center md:flex-col">
                <button
                  type="button"
                  onMouseEnter={() => setActiveNode(node.key)}
                  onMouseLeave={() => setActiveNode(null)}
                  onFocus={() => setActiveNode(node.key)}
                  onBlur={() => setActiveNode(null)}
                  className={`flex w-full flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center transition-all ${
                    isActive
                      ? "border-violet-400 bg-violet-50 shadow-[0_0_0_4px_rgba(139,92,246,0.12)] dark:border-violet-500 dark:bg-violet-500/10"
                      : "border-neutral-200 bg-neutral-50 dark:border-zinc-800 dark:bg-zinc-950/60"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isActive
                        ? "bg-violet-500 text-white"
                        : "bg-neutral-200 text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-neutral-950 dark:text-white md:text-sm">{node.label}</span>
                  <span className="text-[10px] text-neutral-500 dark:text-zinc-500">{node.detail}</span>
                </button>

                {index < FLOW_NODES.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="mx-1 hidden h-px flex-1 bg-gradient-to-r from-neutral-300 to-neutral-300 dark:from-zinc-700 dark:to-zinc-700 md:block"
                  />
                )}
                {index < FLOW_NODES.length - 1 && (
                  <div aria-hidden="true" className="my-1 block h-6 w-px self-center bg-neutral-300 dark:bg-zinc-700 md:hidden" />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50 px-4 py-3 text-center dark:border-sky-500/40 dark:bg-sky-500/10">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400">
            <Radio className="h-3.5 w-3.5" />
            Realtime Event Bus — SignalR-ready contract
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-sky-600/70 dark:text-sky-400/60">
            Roadmap: PostgreSQL · Redis · Elasticsearch
          </span>
        </div>
      </div>
    </section>
  );
};
