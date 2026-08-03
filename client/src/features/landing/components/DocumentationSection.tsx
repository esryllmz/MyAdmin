import { ArrowUpRight, BookOpen, KeySquare, Layers, LineChart, SlidersHorizontal } from "lucide-react";
import { DOCUMENTATION_TOPICS } from "../data/landingPreviewData";

const TOPIC_ICONS: Record<string, typeof BookOpen> = {
  "getting-started": BookOpen,
  "role-model": Layers,
  reports: LineChart,
  settings: SlidersHorizontal,
  "api-access": KeySquare,
};

/**
 * There's no separate hosted docs site — this section IS the documentation entry point, and
 * the repository below is the real one (Api/, client/ live at this URL, matches the footer's
 * "Repository" link).
 */
export const DocumentationSection = () => {
  return (
    <section
      id="documentation"
      className="border-y border-outline-variant bg-surface-container-low scroll-mt-16 dark:border-dark-outline-variant dark:bg-dark-surface-container-low"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20 lg:py-28">
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
            className="inline-flex items-center gap-1.5 self-start rounded-md border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high hover:border-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-dark-outline dark:text-dark-on-surface dark:hover:bg-dark-surface-container-high dark:hover:border-dark-on-surface-variant dark:focus-visible:ring-dark-accent/60"
          >
            View repository
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DOCUMENTATION_TOPICS.map((topic) => {
            const Icon = TOPIC_ICONS[topic.key];
            return (
              <div
                key={topic.key}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest"
              >
                <Icon className="h-5 w-5 text-accent-strong dark:text-dark-accent" strokeWidth={2} aria-hidden="true" />
                <h3 className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface">{topic.title}</h3>
                <p className="mt-1.5 text-sm leading-5 text-on-surface-variant dark:text-dark-on-surface-variant">
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
