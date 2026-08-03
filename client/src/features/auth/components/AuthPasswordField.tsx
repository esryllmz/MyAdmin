import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/core/utils/index";

interface AuthPasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Extra content rendered inline with the label, e.g. a "Forgot password?" link. */
  labelAdornment?: React.ReactNode;
  error?: string;
  hint?: string;
  onCapsLockChange?: (isOn: boolean) => void;
  capsLockOn?: boolean;
}

/**
 * Password input shared by Login/Register — show/hide toggle with an accessible name,
 * an optional Caps Lock warning, and the same error/aria wiring as AuthTextField.
 */
export const AuthPasswordField = forwardRef<HTMLInputElement, AuthPasswordFieldProps>(
  ({ label, labelAdornment, error, hint, onCapsLockChange, capsLockOn, id, className, onKeyUp, onKeyDown, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const capsId = `${id}-capslock`;

    const detectCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (typeof e.getModifierState === "function") {
        onCapsLockChange?.(e.getModifierState("CapsLock"));
      }
    };

    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant"
          >
            {label}
          </label>
          {labelAdornment}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
            <Lock size={18} aria-hidden="true" />
          </div>
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={!!error}
            aria-describedby={
              [error ? errorId : null, hint ? hintId : null, capsLockOn ? capsId : null]
                .filter(Boolean)
                .join(" ") || undefined
            }
            onKeyUp={(e) => {
              detectCapsLock(e);
              onKeyUp?.(e);
            }}
            onKeyDown={(e) => {
              detectCapsLock(e);
              onKeyDown?.(e);
            }}
            className={cn(
              "block h-11 w-full rounded-md border bg-surface-container-lowest pl-10 pr-11 text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:bg-dark-surface-container-lowest dark:text-dark-on-surface dark:placeholder:text-dark-on-surface-variant/50 dark:focus-visible:ring-dark-accent/60",
              error
                ? "border-error focus-visible:ring-error/40 dark:border-error"
                : "border-outline-variant dark:border-dark-outline-variant",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant/70 transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant/70 dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60"
          >
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
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
        {capsLockOn && (
          <p id={capsId} role="status" className="mt-1.5 text-xs font-medium text-warning">
            Caps Lock is on.
          </p>
        )}
      </div>
    );
  }
);

AuthPasswordField.displayName = "AuthPasswordField";
