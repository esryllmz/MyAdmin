import { CheckCircle2 } from "lucide-react";

const POINTS = [
  "Role-based access enforced down to individual buttons and mutations",
  "Every change is written to an audit record with actor and entity",
  "Active sessions and devices are visible and revocable per user",
  "Permission grants are reviewable per role, not just per user",
  "API keys carry a visible lifecycle — issued, used, expired, revoked",
];

export const SecuritySection = () => {
  return (
    <section id="security" className="mx-auto max-w-7xl px-6 py-20 scroll-mt-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
            Security operations, made visible.
          </h2>
          <p className="mt-3 max-w-md text-base text-on-surface-variant dark:text-dark-on-surface-variant">
            Access control isn't a checkbox — it's something your team can inspect at any time.
          </p>

          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-on-surface dark:text-dark-on-surface">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-on-surface-variant dark:text-dark-on-surface-variant" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest overflow-hidden">
          <div className="border-b border-outline-variant dark:border-dark-outline-variant px-5 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
              Recent Security Events
            </span>
          </div>
          <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant text-sm">
            {[
              { label: "Role permissions synced", role: "Editor", tone: "ok" },
              { label: "3 failed login attempts", role: "unknown user", tone: "warn" },
              { label: "API key regenerated", role: "Admin", tone: "ok" },
              { label: "Session revoked", role: "Viewer", tone: "ok" },
            ].map((event) => (
              <div key={event.label} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-on-surface dark:text-dark-on-surface">{event.label}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${event.tone === "warn"
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
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
