import { SecurityGame } from "./SecurityGame";

const technologies = ["C# .NET 10", "React", "RBAC", "JWT", "Audit Logs"];

export const Hero = () => {
  return (
    <section className="mx-auto flex h-full max-h-full w-full max-w-6xl flex-col items-center justify-center gap-5 overflow-hidden px-3 py-3 text-center sm:px-4">
      <div className="max-w-4xl">
        <h1 className="bg-gradient-to-r from-zinc-950 via-violet-600 to-pink-500 bg-clip-text text-4xl font-black leading-[1.02] tracking-tight text-transparent dark:from-white dark:via-violet-300 dark:to-pink-300 sm:text-5xl lg:text-6xl">
          Built for Zero-Trust. Engineered for Scale.
        </h1>

        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:text-base">
          An interactive C# .NET 10 & React architecture showcase. Test real-time security pipelines, RBAC
          enforcement, and audit logs live.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-[520px]:hidden">
        {technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1 font-mono text-xs font-medium text-zinc-700 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700"
          >
            {tech}
          </span>
        ))}
      </div>

      <SecurityGame />
    </section>
  );
};
