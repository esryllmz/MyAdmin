import { NavLink } from 'react-router-dom';
import { BrandLogo } from '@/core/components/common/BrandLogo';
import { useCurrentRole } from '@/core/hooks/useCurrentRole';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Admin', 'Editor', 'Viewer'] },
  { name: 'User Management', icon: 'group', path: '/team', roles: ['Admin', 'Editor'] },
  { name: 'Roles and Permissions', icon: 'shield_person', path: '/roles', roles: ['Admin'] },
  { name: 'Activities', icon: 'history', path: '/activities', roles: ['Admin', 'Editor', 'Viewer'] },
  { name: 'Reports', icon: 'monitoring', path: '/reports', roles: ['Admin', 'Editor', 'Viewer'] },
  { name: 'Settings', icon: 'settings', path: '/settings', roles: ['Admin'] },
];

export const Sidebar = () => {
  const role = useCurrentRole();
  const navItems = ALL_NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <nav className="h-screen sticky left-0 top-0 w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 px-4 hidden md:flex z-40">
      <div className="mb-10 px-4">
        <BrandLogo variant="full" linkTo={null} />
      </div>

      <div className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all ${isActive
                ? 'text-primary bg-surface-container-highest shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
