import React, { forwardRef } from "react";
import { cn } from "@/core/utils/index";

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

/**
 * Shared text input for Login/Register forms — label, error message under the field,
 * aria-invalid/aria-describedby wiring, and a consistent 44px+ touch target.
 */
export const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  ({ label, error, icon, hint, id, className, ...props }, ref) => {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    return (
      <div>
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              "block h-11 w-full rounded-md border bg-surface-container-lowest px-3 text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:bg-dark-surface-container-lowest dark:text-dark-on-surface dark:placeholder:text-dark-on-surface-variant/50 dark:focus-visible:ring-dark-accent/60",
              icon ? "pl-10" : "",
              error
                ? "border-error focus-visible:ring-error/40 dark:border-error"
                : "border-outline-variant dark:border-dark-outline-variant",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

AuthTextField.displayName = "AuthTextField";
