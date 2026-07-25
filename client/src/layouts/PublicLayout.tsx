import { Link } from "react-router-dom";
import { ThemeToggle } from "@/core/components/ThemeToggle";
import { BrandLogo } from "@/core/components/common/BrandLogo";
import { useInstantDemo } from "@/features/landing/hooks/useInstantDemo";
import { FloatingDemoBar } from "@/features/landing/components/FloatingDemoBar";
import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  footer?: ReactNode;
}

export const PublicLayout = ({
  children,
  className = "min-h-screen",
  mainClassName = "flex-1",
  footer,
}: PublicLayoutProps) => {
  const startInstantDemo = useInstantDemo();

  return (
    <div className={`relative isolate bg-white dark:bg-black text-neutral-950 dark:text-white font-sans antialiased flex flex-col ${className}`}>
      <header className="sticky top-0 z-50 shrink-0 border-none bg-transparent px-8 py-4">
        <div className="mx-auto flex items-center justify-between gap-3 max-w-7xl">
          <BrandLogo variant="wordmark" size="lg" linkTo="/" />

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/esryllmz/MyAdmin"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-zinc-100/80 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.59 2 12.253c0 4.525 2.865 8.363 6.839 9.718.5.094.683-.222.683-.494 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.376-3.369-1.376-.455-1.186-1.11-1.502-1.11-1.502-.908-.636.069-.623.069-.623 1.004.072 1.532 1.057 1.532 1.057.892 1.565 2.34 1.113 2.91.851.091-.662.349-1.113.635-1.369-2.221-.259-4.555-1.139-4.555-5.068 0-1.119.39-2.034 1.03-2.751-.103-.26-.446-1.302.098-2.713 0 0 .84-.276 2.75 1.05A9.285 9.285 0 0 1 12 6.949c.85.004 1.705.118 2.504.346 1.909-1.326 2.747-1.05 2.747-1.05.546 1.411.203 2.453.1 2.713.64.717 1.028 1.632 1.028 2.751 0 3.94-2.338 4.806-4.566 5.06.359.318.678.944.678 1.902 0 1.372-.013 2.478-.013 2.814 0 .274.18.593.688.493C19.138 20.613 22 16.777 22 12.253 22 6.59 17.523 2 12 2Z"
                />
              </svg>
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => startInstantDemo("Admin")}
              className="inline-flex rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_28px_rgba(236,72,153,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(168,85,247,0.42)] sm:px-4"
            >
              <span className="sm:hidden">⚡ Demo</span>
              <span className="hidden sm:inline">⚡ Instant Demo</span>
            </button>
            <Link
              to="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className={mainClassName}>{children}</main>

      {footer}

      <FloatingDemoBar />
    </div>
  );
};
