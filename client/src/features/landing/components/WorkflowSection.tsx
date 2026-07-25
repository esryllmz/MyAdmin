import { ClipboardCheck, Eye, Search, ShieldCheck, UserPlus } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "Invite", description: "Bring a teammate in with a scoped role." },
  { icon: ShieldCheck, title: "Assign", description: "Attach permissions through Admin, Editor, or Viewer." },
  { icon: Eye, title: "Review", description: "Check access against current responsibilities." },
  { icon: Search, title: "Monitor", description: "Watch activity and session behavior in real time." },
  { icon: ClipboardCheck, title: "Audit", description: "Confirm every mutation is recorded and explainable." },
];

export const WorkflowSection = () => {
  return (
    <section id="workflow" className="border-y border-outline-variant dark:border-dark-outline-variant bg-surface-container-low dark:bg-dark-surface-container-low scroll-mt-16">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface md:text-4xl">
            One workflow, start to finish.
          </h2>
          <p className="mt-3 text-base text-on-surface-variant dark:text-dark-on-surface-variant">
            Every access change follows the same accountable path.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-outline-variant dark:border-dark-outline-variant bg-outline-variant dark:bg-dark-outline-variant sm:grid-cols-5">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative flex flex-col gap-3 bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6"
              >
                <span className="text-[11px] font-semibold text-on-surface-variant/60 dark:text-dark-on-surface-variant/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="h-5 w-5 text-on-surface dark:text-dark-on-surface" strokeWidth={1.75} />
                <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">{step.title}</h3>
                <p className="text-xs leading-5 text-on-surface-variant dark:text-dark-on-surface-variant">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
