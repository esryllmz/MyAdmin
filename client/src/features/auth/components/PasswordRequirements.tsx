import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "../utils/authValidation";
import { cn } from "@/core/utils/index";

interface PasswordRequirementsProps {
  password: string;
  /** Only show a requirement as failed once the user has started typing. */
  active: boolean;
}

export const PasswordRequirements = ({ password, active }: PasswordRequirementsProps) => {
  const metCount = PASSWORD_REQUIREMENTS.filter((rule) => rule.test(password)).length;
  const strength = metCount / PASSWORD_REQUIREMENTS.length;

  return (
    <div className="mt-2">
      <div className="flex h-1 gap-1" aria-hidden="true">
        {PASSWORD_REQUIREMENTS.map((rule, index) => (
          <span
            key={rule.key}
            className={cn(
              "flex-1 rounded-full transition-colors",
              index < metCount
                ? strength === 1
                  ? "bg-accent-strong dark:bg-dark-accent"
                  : "bg-warning-strong dark:bg-warning"
                : "bg-outline-variant dark:bg-dark-outline-variant"
            )}
          />
        ))}
      </div>

      <ul className="mt-1.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {PASSWORD_REQUIREMENTS.map((rule) => {
          const met = rule.test(password);
          const showAsFailed = active && !met;
          return (
            <li
              key={rule.key}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                met
                  ? "text-accent-strong dark:text-dark-accent"
                  : showAsFailed
                    ? "text-on-surface dark:text-dark-on-surface"
                    : "text-on-surface-variant dark:text-dark-on-surface-variant"
              )}
            >
              {met ? (
                <Check size={13} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
              ) : (
                <X size={13} strokeWidth={2.5} className="shrink-0" aria-hidden="true" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
