import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PREVIEW_STATS = [
  { label: "API Uptime", value: "99.98%" },
  { label: "Active Sessions", value: "42" },
  { label: "Pending Reviews", value: "3" },
];

const PREVIEW_ROWS = [
  { label: "Role sync completed", meta: "2 min ago", tone: "ok" },
  { label: "New user invited", meta: "18 min ago", tone: "ok" },
  { label: "Failed login attempt", meta: "1 hr ago", tone: "warn" },
];

export const Hero = () => {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div>
        <span className="inline-flex items-center rounded-md border border-outline-variant dark:border-dark-outline-variant px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
          Admin Console
        </span>

        <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-on-surface dark:text-dark-on-surface md:text-5xl">
          Administration, without the noise.
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-on-surface-variant dark:text-dark-on-surface-variant">
          A focused control center for teams, permissions, security operations, reporting, and system
          configuration.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-on-surface dark:bg-dark-on-surface px-5 py-3 text-sm font-semibold text-surface dark:text-dark-surface transition-opacity hover:opacity-90"
          >
            Open Console
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/esryllmz/MyAdmin"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-outline-variant dark:border-dark-outline-variant px-5 py-3 text-sm font-semibold text-on-surface dark:text-dark-on-surface transition-colors hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
          >
            View Documentation
          </a>
        </div>
      </div>

      <div className="rounded-lg border border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-outline-variant dark:border-dark-outline-variant px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
            System Overview
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Operational
          </span>
        </div>

        <div className="grid grid-cols-3 divide-x divide-outline-variant dark:divide-dark-outline-variant border-b border-outline-variant dark:border-dark-outline-variant">
          {PREVIEW_STATS.map((stat) => (
            <div key={stat.label} className="px-4 py-4">
              <p className="text-lg font-bold text-on-surface dark:text-dark-on-surface">{stat.value}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
          {PREVIEW_ROWS.map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="flex items-center gap-2 text-on-surface dark:text-dark-on-surface">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${row.tone === "warn" ? "bg-warning" : "bg-success"}`}
                />
                {row.label}
              </span>
              <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{row.meta}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
