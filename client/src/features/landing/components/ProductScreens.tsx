import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ClipboardCheck, Eye, Search, ShieldCheck, UserPlus } from "lucide-react";

const SCREENS = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "System health, recent activity, and pending reviews at a glance.",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Filterable report views with export status and history.",
  },
  {
    id: "roles",
    title: "Roles",
    description: "Role list with a permission matrix and immediate scope preview.",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Profile, security, notifications, and integrations by module.",
  },
] as const;

type ScreenId = (typeof SCREENS)[number]["id"];

const PROCESS_STEPS = [
  { icon: UserPlus, label: "Invite" },
  { icon: ShieldCheck, label: "Assign" },
  { icon: Eye, label: "Review" },
  { icon: Search, label: "Monitor" },
  { icon: ClipboardCheck, label: "Audit" },
];

const DashboardPreview = () => (
  <div className="p-5">
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: "Health", value: "98.7%" },
        { label: "Active", value: "12" },
        { label: "Pending", value: "3" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-md border border-outline-variant dark:border-dark-outline-variant p-2.5">
          <p className="text-sm font-bold text-on-surface dark:text-dark-on-surface">{stat.value}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-1.5 rounded-md border border-outline-variant dark:border-dark-outline-variant p-3">
      {["Role sync completed", "New user invited", "Pending access review"].map((row) => (
        <div key={row} className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-dark-accent" />
          {row}
        </div>
      ))}
    </div>
  </div>
);

const ReportsPreview = () => (
  <div className="p-5">
    <div className="flex gap-2">
      {["This week", "Activity", "Security"].map((chip) => (
        <div key={chip} className="rounded-md border border-outline-variant dark:border-dark-outline-variant px-2.5 py-1 text-[10px] font-medium text-on-surface-variant dark:text-dark-on-surface-variant">
          {chip}
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-1.5">
      {[90, 74, 60, 45].map((width, i) => (
        <div key={i} className="h-2.5 rounded-full bg-outline-variant/70 dark:bg-dark-outline-variant/70" style={{ width: `${width}%` }} />
      ))}
    </div>
    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-accent dark:text-dark-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent dark:bg-dark-accent" />
      Export ready
    </div>
  </div>
);

const RolesPreview = () => (
  <div className="p-5">
    <div className="flex gap-2">
      {["Admin", "Editor", "Viewer"].map((role) => (
        <div key={role} className="rounded-md border border-outline-variant dark:border-dark-outline-variant px-2.5 py-1 text-[10px] font-medium text-on-surface dark:text-dark-on-surface">
          {role}
        </div>
      ))}
    </div>
    <div className="mt-3 grid grid-cols-4 gap-1.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`h-5 rounded-sm ${i % 3 === 0 ? "bg-accent/70 dark:bg-dark-accent/70" : "border border-outline-variant dark:border-dark-outline-variant"}`}
        />
      ))}
    </div>
  </div>
);

const SettingsPreview = () => (
  <div className="p-5">
    <div className="flex gap-3 border-b border-outline-variant dark:border-dark-outline-variant pb-2">
      {["Profile", "Security", "API"].map((tab, i) => (
        <div
          key={tab}
          className={`text-[11px] font-medium ${i === 0 ? "text-accent dark:text-dark-accent" : "text-on-surface-variant dark:text-dark-on-surface-variant"}`}
        >
          {tab}
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-2">
      {["Two-factor authentication", "Session timeout", "Email notifications"].map((row, i) => (
        <div key={row} className="flex items-center justify-between text-xs">
          <span className="text-on-surface-variant dark:text-dark-on-surface-variant">{row}</span>
          <span className={`h-4 w-7 rounded-full ${i !== 1 ? "bg-accent dark:bg-dark-accent" : "bg-outline-variant dark:bg-dark-outline-variant"}`} />
        </div>
      ))}
    </div>
  </div>
);

const PREVIEW_BY_ID: Record<ScreenId, () => React.ReactElement> = {
  dashboard: DashboardPreview,
  reports: ReportsPreview,
  roles: RolesPreview,
  settings: SettingsPreview,
};

export const ProductScreens = () => {
  const [active, setActive] = useState<ScreenId>("dashboard");
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = SCREENS.findIndex((s) => s.id === active);
  const ActivePreview = PREVIEW_BY_ID[active];

  const focusTab = (index: number) => {
    const nextIndex = (index + SCREENS.length) % SCREENS.length;
    setActive(SCREENS[nextIndex].id);
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
      focusTab(SCREENS.length - 1);
    }
  };

  return (
    <section id="platform" className="mx-auto max-w-7xl px-6 py-20 scroll-mt-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
          A console for every part of the job.
        </h2>
        <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
          Each screen is purpose-built — no page is a re-skinned copy of another.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <div
          role="tablist"
          aria-label="Product preview"
          aria-orientation="vertical"
          className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-1"
        >
          {SCREENS.map((screen, index) => {
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
                className={`rounded-md px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:focus-visible:ring-dark-accent/60 ${
                  isActive
                    ? "bg-accent-soft text-accent dark:bg-dark-accent-soft dark:text-dark-accent"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface"
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
              {SCREENS[activeIndex].title}
            </span>
          </div>
          <div aria-hidden="true">
            <ActivePreview />
          </div>
          <p className="border-t border-outline-variant px-4 py-3 text-xs text-on-surface-variant dark:border-dark-outline-variant dark:text-dark-on-surface-variant">
            {SCREENS[activeIndex].description}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-lg border border-outline-variant bg-surface-container-low px-6 py-4 dark:border-dark-outline-variant dark:bg-dark-surface-container-low">
        {PROCESS_STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant">
                <Icon className="h-3.5 w-3.5 text-accent dark:text-dark-accent" aria-hidden="true" />
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
