import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { ClipboardCheck, Eye, Search, ShieldCheck, UserPlus } from "lucide-react";
import {
  PRODUCT_SCREENS,
  PROCESS_STEPS,
  DASHBOARD_PREVIEW,
  REPORTS_PREVIEW,
  ROLES_PREVIEW,
  SETTINGS_PREVIEW,
} from "../data/landingPreviewData";

type ScreenId = (typeof PRODUCT_SCREENS)[number]["id"];

const PROCESS_ICONS: Record<(typeof PROCESS_STEPS)[number]["key"], typeof UserPlus> = {
  invite: UserPlus,
  assign: ShieldCheck,
  review: Eye,
  monitor: Search,
  audit: ClipboardCheck,
};

const DashboardPreview = () => (
  <div className="p-5">
    <div className="grid grid-cols-3 gap-2">
      {DASHBOARD_PREVIEW.stats.map((stat) => (
        <div key={stat.label} className="rounded-md border border-outline-variant p-2.5 dark:border-dark-outline-variant">
          <p className="text-sm font-bold text-on-surface dark:text-dark-on-surface">{stat.value}</p>
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-1.5 rounded-md border border-outline-variant p-3 dark:border-dark-outline-variant">
      {DASHBOARD_PREVIEW.activity.map((row) => (
        <div key={row} className="flex items-center gap-2 text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-strong dark:bg-dark-accent" />
          {row}
        </div>
      ))}
    </div>
  </div>
);

const ReportsPreview = () => (
  <div className="p-5">
    <div className="flex gap-2">
      {REPORTS_PREVIEW.chips.map((chip) => (
        <div key={chip} className="rounded-md border border-outline px-2.5 py-1 text-[10px] font-semibold text-on-surface-variant dark:border-dark-outline dark:text-dark-on-surface-variant">
          {chip}
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-1.5">
      {REPORTS_PREVIEW.barWidths.map((width, i) => (
        <div key={i} className="h-2.5 rounded-full bg-outline" style={{ width: `${width}%` }} />
      ))}
    </div>
    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-accent-strong dark:text-dark-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-strong dark:bg-dark-accent" />
      Export ready
    </div>
  </div>
);

const RolesPreview = () => (
  <div className="p-5">
    <div className="flex gap-2">
      {ROLES_PREVIEW.roles.map((role) => (
        <div key={role} className="rounded-md border border-outline px-2.5 py-1 text-[10px] font-semibold text-on-surface dark:border-dark-outline dark:text-dark-on-surface">
          {role}
        </div>
      ))}
    </div>
    <div className="mt-3 grid grid-cols-4 gap-1.5">
      {Array.from({ length: ROLES_PREVIEW.matrixCellCount }).map((_, i) => (
        <div
          key={i}
          className={`h-5 rounded-sm ${i % 3 === 0 ? "bg-accent-strong dark:bg-dark-accent" : "border border-outline dark:border-dark-outline"}`}
        />
      ))}
    </div>
  </div>
);

const SettingsPreview = () => (
  <div className="p-5">
    <div className="flex gap-4 border-b border-outline-variant pb-2 dark:border-dark-outline-variant">
      {SETTINGS_PREVIEW.tabs.map((tab, i) => (
        <div
          key={tab}
          className={`text-[11px] font-semibold ${i === 0 ? "text-accent-strong dark:text-dark-accent" : "text-on-surface-variant dark:text-dark-on-surface-variant"}`}
        >
          {tab}
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-2.5">
      {SETTINGS_PREVIEW.rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-xs font-medium">
          <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{row.label}</span>
          <span className={`h-4 w-7 rounded-full ${row.on ? "bg-accent-strong dark:bg-dark-accent" : "border border-outline dark:border-dark-outline"}`} />
        </div>
      ))}
    </div>
  </div>
);

const PREVIEW_BY_ID: Record<ScreenId, () => ReactElement> = {
  dashboard: DashboardPreview,
  reports: ReportsPreview,
  roles: RolesPreview,
  settings: SettingsPreview,
};

export const ProductScreens = () => {
  const [active, setActive] = useState<ScreenId>("dashboard");
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = PRODUCT_SCREENS.findIndex((s) => s.id === active);
  const ActivePreview = PREVIEW_BY_ID[active];

  const focusTab = (index: number) => {
    const nextIndex = (index + PRODUCT_SCREENS.length) % PRODUCT_SCREENS.length;
    setActive(PRODUCT_SCREENS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusTab(activeIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusTab(activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(PRODUCT_SCREENS.length - 1);
    }
  };

  return (
    <section id="platform" className="mx-auto max-w-7xl px-6 py-14 scroll-mt-16 sm:py-20 lg:py-28">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
          A console for every part of the job.
        </h2>
        <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
          Each screen is purpose-built — no page is a re-skinned copy of another.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
        <div
          role="tablist"
          aria-label="Product preview"
          aria-orientation="vertical"
          className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1"
        >
          {PRODUCT_SCREENS.map((screen, index) => {
            const isActive = screen.id === active;
            return (
              <button
                key={screen.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${screen.id}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel-${screen.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(screen.id)}
                onKeyDown={handleKeyDown}
                className={`w-full rounded-md border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:focus-visible:ring-dark-accent/60 ${
                  isActive
                    ? "border-accent-border bg-accent-soft font-semibold text-accent-strong dark:border-dark-accent-border dark:bg-dark-accent-soft dark:text-dark-accent-strong"
                    : "border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface"
                }`}
              >
                {screen.title}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel-${active}`}
          aria-labelledby={`${baseId}-tab-${active}`}
          className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest"
        >
          <div className="border-b border-outline-variant px-4 py-2.5 dark:border-dark-outline-variant">
            <span className="text-xs font-semibold text-on-surface dark:text-dark-on-surface">
              {PRODUCT_SCREENS[activeIndex].title}
            </span>
          </div>
          <div aria-hidden="true">
            <ActivePreview />
          </div>
          <p className="border-t border-outline-variant px-4 py-3 text-xs text-on-surface-variant dark:border-dark-outline-variant dark:text-dark-on-surface-variant">
            {PRODUCT_SCREENS[activeIndex].description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-lg border border-outline-variant bg-surface-container-low px-6 py-4 dark:border-dark-outline-variant dark:bg-dark-surface-container-low">
        {PROCESS_STEPS.map((step, index) => {
          const Icon = PROCESS_ICONS[step.key];
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface dark:text-dark-on-surface">
                <Icon className="h-3.5 w-3.5 text-accent-strong dark:text-dark-accent" strokeWidth={2} aria-hidden="true" />
                {step.label}
              </div>
              {index < PROCESS_STEPS.length - 1 && (
                <span className="hidden text-outline dark:text-dark-outline sm:inline" aria-hidden="true">
                  &rarr;
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
