import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/core/components/ThemeToggle";
import { BrandLogo } from "@/core/components/common/BrandLogo";

interface AuthLayoutProps {
  /** Right column — the actual form. On mobile this is the only thing shown. */
  children: ReactNode;
  /** Left column — brand/marketing content. Hidden on mobile, shown on lg+. */
  panel?: ReactNode;
}

/**
 * Dedicated auth shell for Login / Register / Forgot Password.
 * Deliberately does NOT reuse the marketing PublicLayout header — no Features/Platform/
 * Security/Documentation/Sign In links here, just brand, a way back home, and theme.
 */
export const AuthLayout = ({ children, panel }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased dark:bg-dark-surface dark:text-dark-on-surface">
      <header className="shrink-0 border-b border-outline-variant px-4 dark:border-dark-outline-variant sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <BrandLogo variant="wordmark" size="md" linkTo="/" />

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Back to home</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 lg:grid-cols-[1fr_460px] lg:gap-14">
          {panel && <div className="hidden lg:block">{panel}</div>}
          <div className="mx-auto w-full max-w-[460px]">{children}</div>
        </div>
      </main>
    </div>
  );
};
