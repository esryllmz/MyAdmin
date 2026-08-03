import { Fingerprint, FileBarChart, SlidersHorizontal } from "lucide-react";
import {
  IDENTITY_ACCESS_ROWS,
  REPORTING_AUDIT_EVENTS,
  SYSTEM_OPERATIONS_ROWS,
} from "../data/landingPreviewData";

export const CapabilitiesGrid = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-14 scroll-mt-16 sm:py-20 lg:py-28">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
          Three areas. One workspace.
        </h2>
        <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
          Identity, reporting, and system operations — each with its own focused view, not a
          repeated card template.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Identity and Access */}
        <div className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
          <Fingerprint className="h-6 w-6 text-on-surface dark:text-dark-on-surface" strokeWidth={2} aria-hidden="true" />
          <h3 className="mt-5 text-base font-semibold text-on-surface dark:text-dark-on-surface">
            Identity and Access
          </h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
            Users, teams, roles, permissions, and access reviews — kept together, not scattered.
          </p>

          <div
            aria-hidden="true"
            className="mt-5 overflow-hidden rounded-md border border-outline-variant dark:border-dark-outline-variant"
          >
            <div className="grid grid-cols-3 gap-px bg-outline-variant text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant dark:bg-dark-outline-variant dark:text-dark-on-surface-variant">
              <div className="bg-surface-container-low px-2 py-1.5 dark:bg-dark-surface-container-low">Scope</div>
              <div className="bg-surface-container-low px-2 py-1.5 dark:bg-dark-surface-container-low">Level</div>
              <div className="bg-surface-container-low px-2 py-1.5 dark:bg-dark-surface-container-low" />
            </div>
            {IDENTITY_ACCESS_ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-t border-outline-variant px-3 py-2 text-xs dark:border-dark-outline-variant">
                <span className="font-medium text-on-surface dark:text-dark-on-surface">{row.label}</span>
                <span className="rounded-sm border border-accent-border bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent-strong dark:border-dark-accent-border dark:bg-dark-accent-soft dark:text-dark-accent-strong">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-outline-variant pt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:border-dark-outline-variant dark:text-dark-on-surface-variant">
            Admin · Editor · Viewer
          </p>
        </div>

        {/* Reporting and Audit */}
        <div className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
          <FileBarChart className="h-6 w-6 text-on-surface dark:text-dark-on-surface" strokeWidth={2} aria-hidden="true" />
          <h3 className="mt-5 text-base font-semibold text-on-surface dark:text-dark-on-surface">
            Reporting and Audit
          </h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
            Activity reports, permission changes, security events, and export history in one
            timeline.
          </p>

          <div
            aria-hidden="true"
            className="mt-5 space-y-0 overflow-hidden rounded-md border border-outline-variant dark:border-dark-outline-variant"
          >
            {REPORTING_AUDIT_EVENTS.map((event, index) => (
              <div
                key={event.label}
                className={`flex items-center justify-between px-3 py-2 text-xs ${index > 0 ? "border-t border-outline-variant dark:border-dark-outline-variant" : ""}`}
              >
                <span className="flex items-center gap-2 font-medium text-on-surface dark:text-dark-on-surface">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-strong dark:bg-dark-accent" />
                  {event.label}
                </span>
                <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{event.meta}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-outline-variant pt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:border-dark-outline-variant dark:text-dark-on-surface-variant">
            Exportable · Filterable
          </p>
        </div>

        {/* System Operations */}
        <div className="flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
          <SlidersHorizontal className="h-6 w-6 text-on-surface dark:text-dark-on-surface" strokeWidth={2} aria-hidden="true" />
          <h3 className="mt-5 text-base font-semibold text-on-surface dark:text-dark-on-surface">
            System Operations
          </h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
            Settings, notifications, API keys, integrations, and session management by scope.
          </p>

          <div
            aria-hidden="true"
            className="mt-5 overflow-hidden rounded-md border border-outline-variant dark:border-dark-outline-variant"
          >
            {SYSTEM_OPERATIONS_ROWS.map((row, index) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-3 py-2 text-xs ${index > 0 ? "border-t border-outline-variant dark:border-dark-outline-variant" : ""}`}
              >
                <span className="font-medium text-on-surface dark:text-dark-on-surface">{row.label}</span>
                <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{row.status}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 border-t border-outline-variant pt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:border-dark-outline-variant dark:text-dark-on-surface-variant">
            Configured centrally
          </p>
        </div>
      </div>
    </section>
  );
};
