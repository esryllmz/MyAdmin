import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { ThemeToggle } from "@/core/components/ThemeToggle";
import { BrandLogo } from "@/core/components/common/BrandLogo";

interface PublicLayoutProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  footer?: ReactNode;
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Platform", href: "#platform" },
  { label: "Security", href: "#security" },
  { label: "Documentation", href: "#documentation" },
];

const smoothScrollTo = (hash: string) => {
  const id = hash.replace("#", "");
  const target = document.getElementById(id);
  if (!target) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });

  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash);
  }
};

export const PublicLayout = ({
  children,
  className = "min-h-screen",
  mainClassName = "flex-1",
  footer,
}: PublicLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = "landing-mobile-menu";
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    smoothScrollTo(href);
  };

  return (
    <div
      className={`flex flex-col bg-surface text-on-surface antialiased dark:bg-dark-surface dark:text-dark-on-surface ${className}`}
    >
      <header className="sticky top-0 z-50 shrink-0 border-b border-outline-variant bg-surface-container-lowest px-4 dark:border-dark-outline-variant dark:bg-dark-surface-container-low sm:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3">
          <BrandLogo variant="wordmark" size="md" linkTo="/" />

          <nav aria-label="Main" className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded-sm text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60 sm:inline-flex"
            >
              Sign in
            </Link>

            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface dark:focus-visible:ring-dark-accent/60 md:hidden"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id={menuId}
            aria-label="Mobile"
            className="border-t border-outline-variant py-3 dark:border-dark-outline-variant md:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="block rounded-md px-2 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 dark:text-dark-on-surface-variant dark:hover:bg-dark-surface-container-high dark:hover:text-dark-on-surface"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high dark:text-dark-on-surface dark:hover:bg-dark-surface-container-high"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main className={mainClassName}>{children}</main>

      {footer}
    </div>
  );
};
