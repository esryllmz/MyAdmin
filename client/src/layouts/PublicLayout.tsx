import { Link } from "react-router-dom";
import { ThemeToggle } from "@/core/components/ThemeToggle";
import { BrandLogo } from "@/core/components/common/BrandLogo";
import type { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  footer?: ReactNode;
}

const NAV_LINKS = [
  { label: "Features", href: "#capabilities" },
  { label: "Platform", href: "#workflow" },
  { label: "Security", href: "#security" },
  { label: "Documentation", href: "https://github.com/esryllmz/MyAdmin" },
];

export const PublicLayout = ({
  children,
  className = "min-h-screen",
  mainClassName = "flex-1",
  footer,
}: PublicLayoutProps) => {
  return (
    <div className={`bg-surface dark:bg-dark-surface text-on-surface dark:text-dark-on-surface font-sans antialiased flex flex-col ${className}`}>
      <header className="sticky top-0 z-50 shrink-0 border-b border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-low px-4 sm:px-8">
        <div className="mx-auto flex h-16 items-center justify-between gap-3 max-w-7xl">
          <BrandLogo variant="wordmark" size="md" linkTo="/" />

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-on-surface-variant dark:text-dark-on-surface-variant transition-colors hover:text-on-surface dark:hover:text-dark-on-surface"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className={mainClassName}>{children}</main>

      {footer}
    </div>
  );
};
