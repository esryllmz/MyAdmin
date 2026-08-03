import { CheckCircle2 } from "lucide-react";
import { SECURITY_POINTS, SECURITY_EVENTS } from "../data/landingPreviewData";

export const SecuritySection = () => {
  return (
    <section id="security" className="mx-auto max-w-7xl px-6 py-14 scroll-mt-16 sm:py-20 lg:py-28">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
            Security your team can inspect.
          </h2>
          <p className="mt-3 max-w-md text-base text-on-surface-variant dark:text-dark-on-surface-variant">
            Review access, sessions, permissions, and sensitive changes from one traceable
            workspace.
          </p>

          <ul className="mt-8 space-y-4">
            {SECURITY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-on-surface dark:text-dark-on-surface">
                <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent-strong dark:text-dark-accent" strokeWidth={2} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
          <div className="border-b border-outline-variant px-5 py-3 dark:border-dark-outline-variant">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
              Recent Security Events
            </span>
          </div>
          <div className="divide-y divide-outline-variant text-sm dark:divide-dark-outline-variant">
            {SECURITY_EVENTS.map((event) => (
              <div key={event.label} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <span className="font-medium text-on-surface dark:text-dark-on-surface">{event.label}</span>
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    event.tone === "warn"
                      ? "border-warning-border bg-warning-soft text-warning-strong dark:border-dark-warning-border dark:bg-dark-warning-soft dark:text-warning"
                      : "border-accent-border bg-accent-soft text-accent-strong dark:border-dark-accent-border dark:bg-dark-accent-soft dark:text-dark-accent-strong"
                  }`}
                >
                  {event.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
