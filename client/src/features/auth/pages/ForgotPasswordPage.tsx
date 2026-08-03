import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";

/**
 * The API has no password-reset/forgot-password endpoint (only login, register,
 * refresh-token, revoke-token — see Api/Features/Authentication/AuthenticationController.cs).
 * Rather than simulate a fake "email sent" flow that never actually sends anything, this page
 * is honest about the current limitation and routes users to their administrator instead.
 */
const ForgotPasswordPage = () => {
  return (
    <AuthLayout>
      <div className="rounded-xl border border-outline bg-surface-container-lowest p-8 text-center shadow-[0_20px_40px_-15px_rgba(11,28,48,0.12)] dark:border-dark-outline dark:bg-dark-surface-container-lowest">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-border bg-accent-soft dark:border-dark-accent-border dark:bg-dark-accent-soft">
          <KeyRound size={24} strokeWidth={2} className="text-accent-strong dark:text-dark-accent-strong" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">
          Forgot your password?
        </h1>

        <p className="mt-3 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
          Password reset is not available yet.
        </p>
        <p className="mt-4 text-sm leading-6 text-on-surface dark:text-dark-on-surface">
          Contact your workspace administrator to request a password reset. After your password
          is updated, return here and sign in again.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <Link
            to="/login"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-on-surface text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 dark:bg-dark-on-surface dark:text-dark-surface dark:focus-visible:ring-dark-accent/60"
          >
            Back to sign in
          </Link>
          <Link
            to="/"
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md border border-outline text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:border-dark-outline dark:text-dark-on-surface dark:hover:bg-dark-surface-container-high dark:focus-visible:ring-dark-accent/60"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
