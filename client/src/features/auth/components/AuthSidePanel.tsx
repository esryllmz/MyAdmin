import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  label: string;
}

interface AuthSidePanelProps {
  title: string;
  description: string;
  features: Feature[];
  /** The decorative "Workspace Status" mini-preview — on by default, off for Register so its
   * side panel isn't just a copy of Login's and the page stays shorter. */
  showStatusPreview?: boolean;
}

const PREVIEW_ROWS = [
  { label: "Role sync completed", tone: "ok" as const },
  { label: "New session started", tone: "ok" as const },
  { label: "Failed login attempt", tone: "warn" as const },
];

/**
 * Left column shown on the Login/Register pages (desktop only — AuthLayout hides it below
 * lg). Purely informational/decorative, so the mini product preview is aria-hidden.
 */
export const AuthSidePanel = ({ title, description, features, showStatusPreview = true }: AuthSidePanelProps) => {
  return (
    <div className="max-w-md">
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-on-surface dark:text-dark-on-surface">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-on-surface-variant dark:text-dark-on-surface-variant">
        {description}
      </p>

      <ul className="mt-8 space-y-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent-border bg-accent-soft dark:border-dark-accent-border dark:bg-dark-accent-soft">
                <Icon size={17} strokeWidth={2} className="text-accent-strong dark:text-dark-accent-strong" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{feature.label}</span>
            </li>
          );
        })}
      </ul>

      {showStatusPreview && (
        <div
          aria-hidden="true"
          className="mt-10 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest"
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-2.5 dark:border-dark-outline-variant">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
              Workspace Status
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface dark:text-dark-on-surface">
              <span className="h-2 w-2 rounded-full bg-accent-strong dark:bg-dark-accent" />
              Operational
            </span>
          </div>
          <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
            {PREVIEW_ROWS.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="flex items-center gap-2 font-medium text-on-surface dark:text-dark-on-surface">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${row.tone === "warn" ? "bg-warning-strong dark:bg-warning" : "bg-accent-strong dark:bg-dark-accent"}`}
                  />
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
