import { ArrowUpRight, BookOpen, KeySquare, Layers, LineChart, SlidersHorizontal } from "lucide-react";

const TOPICS = [
  { icon: BookOpen, title: "Getting started", description: "Sign in, orient yourself, and find your way around the console." },
  { icon: Layers, title: "Role model", description: "How Admin, Editor, and Viewer scope what a user can see and do." },
  { icon: LineChart, title: "Reports", description: "Filter, export, and schedule activity, security, and permission reports." },
  { icon: SlidersHorizontal, title: "Settings", description: "Profile, security, notifications, and integration configuration." },
  { icon: KeySquare, title: "API access", description: "Issuing, using, and revoking API keys for integrations." },
];

/**
 * There's no separate hosted docs site — this section IS the documentation entry point, and
 * the repository below is the real one (Api/, client/ live at this URL, matches the footer's
 * "Repository" link).
 */
export const DocumentationSection = () => {
  return (
    <section
      id="documentation"
      className="border-y border-outline-variant bg-surface-container-low dark:border-dark-outline-variant dark:bg-dark-surface-container-low scroll-mt-16"
    >
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
              Documentation and getting started.
            </h2>
            <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
              Everything you need to onboard a team onto MyAdmin.
            </p>
          </div>

          <a
            href="https://github.com/esryllmz/MyAdmin"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 self-start rounded-md border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-dark-outline-variant dark:text-dark-on-surface dark:hover:bg-dark-surface-container-high dark:focus-visible:ring-dark-accent/60"
          >
            View repository
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.title}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest"
              >
                <Icon className="h-5 w-5 text-accent dark:text-dark-accent" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface">{topic.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-on-surface-variant dark:text-dark-on-surface-variant">
                  {topic.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
