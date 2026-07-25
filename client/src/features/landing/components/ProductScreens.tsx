const SCREENS = [
  {
    title: "Dashboard",
    description: "System health, recent activity, and role distribution at a glance.",
    kind: "stats" as const,
  },
  {
    title: "Reports",
    description: "Filterable report views with saved presets and export history.",
    kind: "table" as const,
  },
  {
    title: "Roles",
    description: "Permission matrix editing with immediate scope preview.",
    kind: "matrix" as const,
  },
  {
    title: "Settings",
    description: "Profile, security, notifications, and integrations by module.",
    kind: "tabs" as const,
  },
];

const MockScreen = ({ kind }: { kind: (typeof SCREENS)[number]["kind"] }) => {
  if (kind === "stats") {
    return (
      <div className="grid grid-cols-3 gap-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-md border border-outline-variant dark:border-dark-outline-variant p-2.5">
            <div className="h-2 w-8 rounded-full bg-outline-variant dark:bg-dark-outline-variant" />
            <div className="mt-2 h-3 w-10 rounded-full bg-on-surface-variant/40 dark:bg-dark-on-surface-variant/40" />
          </div>
        ))}
        <div className="col-span-3 mt-1 h-14 rounded-md border border-outline-variant dark:border-dark-outline-variant" />
      </div>
    );
  }

  if (kind === "table") {
    return (
      <div className="p-4">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-md border border-outline-variant dark:border-dark-outline-variant" />
          <div className="h-6 w-16 rounded-md border border-outline-variant dark:border-dark-outline-variant" />
          <div className="h-6 w-16 rounded-md border border-outline-variant dark:border-dark-outline-variant" />
        </div>
        <div className="mt-3 space-y-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2.5 rounded-full bg-outline-variant/70 dark:bg-dark-outline-variant/70" style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "matrix") {
    return (
      <div className="p-4">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`h-5 rounded-sm ${i % 3 === 0 ? "bg-on-surface-variant/50 dark:bg-dark-on-surface-variant/50" : "border border-outline-variant dark:border-dark-outline-variant"}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex gap-3 border-b border-outline-variant dark:border-dark-outline-variant pb-2">
        {["Profile", "Security", "API"].map((tab, i) => (
          <div
            key={tab}
            className={`h-2.5 w-12 rounded-full ${i === 0 ? "bg-on-surface dark:bg-dark-on-surface" : "bg-outline-variant dark:bg-dark-outline-variant"}`}
          />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-outline-variant dark:bg-dark-outline-variant" />
        <div className="h-2.5 w-1/2 rounded-full bg-outline-variant dark:bg-dark-outline-variant" />
      </div>
    </div>
  );
};

export const ProductScreens = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
          A console for every part of the job.
        </h2>
        <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
          Each screen is purpose-built — no page is a re-skinned copy of another.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {SCREENS.map((screen) => (
          <div
            key={screen.title}
            className="overflow-hidden rounded-lg border border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest"
          >
            <div className="border-b border-outline-variant dark:border-dark-outline-variant px-4 py-2.5">
              <span className="text-xs font-semibold text-on-surface dark:text-dark-on-surface">{screen.title}</span>
            </div>
            <MockScreen kind={screen.kind} />
            <p className="border-t border-outline-variant dark:border-dark-outline-variant px-4 py-3 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
              {screen.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
