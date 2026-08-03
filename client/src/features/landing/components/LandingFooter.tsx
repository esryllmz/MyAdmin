import { BrandLogo } from "@/core/components/common/BrandLogo";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Reports", href: "/reports" },
      { label: "Settings", href: "/settings/profile" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#documentation" },
      { label: "Repository", href: "https://github.com/esryllmz/MyAdmin", external: true },
    ],
  },
  {
    heading: "Security",
    links: [
      { label: "Access Reviews", href: "/security/access-reviews" },
      { label: "Sessions", href: "/security/sessions" },
    ],
  },
];

export const LandingFooter = () => {
  return (
    <footer className="border-t border-outline-variant dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-low">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <BrandLogo variant="footer" linkTo={null} />
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                {column.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noreferrer" : undefined}
                      className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-outline-variant dark:border-dark-outline-variant pt-6">
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
            © 2026 MyAdmin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
