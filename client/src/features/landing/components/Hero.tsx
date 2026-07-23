import { Link } from "react-router-dom";
import { InteractiveShowcase } from "./InteractiveShowcase";
import { useInstantDemo } from "../hooks/useInstantDemo";

export const Hero = () => {
  const startInstantDemo = useInstantDemo();

  return (
    <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-16 text-center lg:py-24">
      <div className="max-w-4xl">
        <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-zinc-950 dark:text-white md:text-7xl">
          Built for Zero-Trust.{" "}
          <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
            Engineered for Scale.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300 md:text-lg">
          An interactive C# .NET 10 & React architecture showcase. Test real-time security pipelines, RBAC
          enforcement, and audit logs live.
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
    </section>
  );
};
