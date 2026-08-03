import { Link } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
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
      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Self-service password reset isn't available yet.
        </p>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
        <div className="flex justify-center lg:justify-start">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft dark:bg-dark-accent-soft">
            <LifeBuoy size={22} className="text-accent dark:text-dark-accent" aria-hidden="true" />
          </span>
        </div>
        <p className="mt-4 text-center text-sm leading-6 text-on-surface dark:text-dark-on-surface lg:text-left">
          Password reset by email isn't connected yet. To regain access to your account, please
          contact your workspace administrator and ask them to reset your password.
        </p>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-on-surface transition-colors hover:text-accent dark:text-dark-on-surface dark:hover:text-dark-accent"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
