import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

/**
 * Reached when a route requires a role/feature the current user doesn't have (see
 * ProtectedRoute's requiredRole/requiredFeature checks). This is a route-guard result, not a
 * network error — no system/permission internals are shown, just a way back.
 */
const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 dark:bg-dark-surface">
      <div className="w-full max-w-md rounded-xl border border-outline bg-surface-container-lowest p-8 text-center shadow-[0_20px_40px_-15px_rgba(11,28,48,0.12)] dark:border-dark-outline dark:bg-dark-surface-container-lowest">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-outline bg-surface-container-low dark:border-dark-outline dark:bg-dark-surface-container-low">
          <ShieldAlert size={24} strokeWidth={2} className="text-on-surface-variant dark:text-dark-on-surface-variant" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">
          You don't have access to this page
        </h1>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant dark:text-dark-on-surface-variant">
          Your account doesn't have the permissions this page requires. If you think this is a
          mistake, contact your workspace administrator.
        </p>

        <Link
          to="/dashboard"
          className="mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-on-surface text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 dark:bg-dark-on-surface dark:text-dark-surface dark:focus-visible:ring-dark-accent/60"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
