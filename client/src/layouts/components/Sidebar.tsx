import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BrandLogo } from '@/core/components/common/BrandLogo';
import { useCurrentRole } from '@/core/hooks/useCurrentRole';
import { toggleSidebarCollapsed } from '@/core/store/uiSlice';
import type { RootState } from '@/core/store/store';

interface NavItem {
  name: string;
  icon: string;
  path: string;
  roles: string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Admin', 'Editor', 'Viewer'] },
      { name: 'Reports', icon: 'monitoring', path: '/reports', roles: ['Admin', 'Editor', 'Viewer'] },
      { name: 'Activity', icon: 'history', path: '/activities', roles: ['Admin', 'Editor', 'Viewer'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Users', icon: 'group', path: '/team', roles: ['Admin', 'Editor'] },
      { name: 'Roles', icon: 'shield_person', path: '/roles', roles: ['Admin'] },
      { name: 'Permissions', icon: 'key', path: '/permissions', roles: ['Admin'] },
      { name: 'Teams', icon: 'diversity_3', path: '/teams', roles: ['Admin', 'Editor'] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', icon: 'settings', path: '/settings/profile', roles: ['Admin', 'Editor', 'Viewer'] },
      { name: 'API Keys', icon: 'vpn_key', path: '/settings/api-keys', roles: ['Admin', 'Editor'] },
      { name: 'Integrations', icon: 'hub', path: '/integrations', roles: ['Admin'] },
      { name: 'Security', icon: 'security', path: '/security', roles: ['Admin'] },
    ],
  },
];

export const Sidebar = () => {
  const role = useCurrentRole();
  const dispatch = useDispatch();
  const isCollapsed = useSelector((state: RootState) => state.ui.isSidebarCollapsed);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => role && item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav
      className={`h-screen sticky left-0 top-0 shrink-0 bg-surface-container-lowest dark:bg-dark-surface-container-low border-r border-outline-variant/60 dark:border-dark-outline-variant flex-col py-5 hidden md:flex z-40 transition-[width] duration-150 ${isCollapsed ? 'w-[76px] px-2' : 'w-64 px-4'
        }`}
    >
      <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
        <BrandLogo variant={isCollapsed ? 'mark' : 'full'} linkTo={null} />
      </div>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                    } ${isActive
                      ? 'bg-on-surface text-surface dark:bg-dark-on-surface dark:text-dark-surface'
                      : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                  {!isCollapsed && item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => dispatch(toggleSidebarCollapsed())}
        aria-label={isCollapsed ? 'Kenar çubuğunu genişlet' : 'Kenar çubuğunu daralt'}
        className={`mt-3 flex items-center gap-2 rounded-md py-2 text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
        {!isCollapsed && 'Daralt'}
      </button>
    </nav>
  );
};
