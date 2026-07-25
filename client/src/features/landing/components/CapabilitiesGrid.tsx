import {
  BellRing,
  FileBarChart,
  Fingerprint,
  Network,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

const CARDS = [
  {
    icon: Fingerprint,
    title: "Identity and Access",
    description: "Assign roles, manage team membership, and review who can act on what.",
    footer: "Admin · Editor · Viewer",
  },
  {
    icon: FileBarChart,
    title: "Operational Reporting",
    description: "Filterable reports across activity, security, and permission changes.",
    list: ["User Activity", "Permission Changes", "System Usage"],
  },
  {
    icon: ShieldAlert,
    title: "Security Events",
    description: "Track failed logins, privilege changes, and suspicious session activity.",
    footer: "Reviewed continuously",
  },
  {
    icon: SlidersHorizontal,
    title: "System Configuration",
    description: "Profile, appearance, and account settings organized by scope.",
    list: ["Profile", "Appearance", "Account"],
  },
  {
    icon: BellRing,
    title: "Notification Management",
    description: "Granular delivery preferences for security, role, and system events.",
    footer: "In-app + email",
  },
  {
    icon: Network,
    title: "Integration Control",
    description: "Manage webhooks, identity providers, and outbound data destinations.",
    footer: "Configured centrally",
  },
];

export const CapabilitiesGrid = () => {
  return (
    <section id="capabilities" className="mx-auto max-w-7xl px-6 py-20 scroll-mt-16">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
          Everything an admin console needs.
        </h2>
        <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
          Six focused modules — each built around a distinct workflow, not a repeated card template.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="flex flex-col rounded-lg border border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6"
            >
              <Icon className="h-6 w-6 text-on-surface dark:text-dark-on-surface" strokeWidth={1.75} />
              <h3 className="mt-5 text-base font-semibold text-on-surface dark:text-dark-on-surface">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
                {card.description}
              </p>

              {card.list && (
                <ul className="mt-4 space-y-1.5 border-t border-outline-variant dark:border-dark-outline-variant pt-4">
                  {card.list.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                      <span className="h-1 w-1 rounded-full bg-on-surface-variant dark:bg-dark-on-surface-variant" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {card.footer && (
                <p className="mt-4 border-t border-outline-variant dark:border-dark-outline-variant pt-4 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
                  {card.footer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
