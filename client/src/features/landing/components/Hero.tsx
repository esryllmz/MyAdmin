import { Link } from "react-router-dom";
import { Eye, PenSquare, Shield } from "lucide-react";
import { InteractiveShowcase } from "./InteractiveShowcase";
import { useInstantDemo, type DemoRole } from "../hooks/useInstantDemo";

const ROLE_SWITCH_OPTIONS: Array<{ role: DemoRole; icon: typeof Shield; label: string }> = [
  { role: "Admin", icon: Shield, label: "Admin" },
  { role: "Editor", icon: PenSquare, label: "Editor" },
  { role: "Viewer", icon: Eye, label: "Viewer" },
];

export const Hero = () => {
  const startInstantDemo = useInstantDemo();

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-16 text-center lg:py-24">
      <div className="max-w-4xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-500 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400">
          .NET 10 · React 19 · Real-Time RBAC
        </span>

        <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-zinc-950 dark:text-white md:text-7xl">
          Enterprise-Grade{" "}
          <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            .NET &amp; React
          </span>{" "}
          Admin Console
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300 md:text-lg">
          A full-stack enterprise admin platform with granular RBAC, cryptographic audit logging, real-time
          monitoring, and a modern React 19 dashboard — backed by a .NET 10 Web API.
        </p>
      </div>

      <InteractiveShowcase />

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => startInstantDemo("Admin")}
          className="rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_34px_rgba(236,72,153,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_0_46px_rgba(168,85,247,0.42)]"
        >
          ⚡ Anında Demo ile Tüm Paneli Keşfet
        </button>
        <Link
          to="/login"
          className="rounded-full px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
        >
          Giriş Yap
        </Link>
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Canlı demo — bir rol seçip anında keşfedin
        </p>
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white/70 p-1.5 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70">
          {ROLE_SWITCH_OPTIONS.map(({ role, icon: Icon, label }) => (
            <button
              key={role}
              type="button"
              onClick={() => startInstantDemo(role)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-700 transition-all hover:-translate-y-0.5 hover:bg-zinc-950 hover:text-white dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
