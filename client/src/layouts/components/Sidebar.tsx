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

/**
 * Viewer gets its own, fully separate information architecture — a short, personal-only nav
 * (Dashboard / My Activity / My Teams / My Access / Settings) with no Reports module and no
 * management surface. Notifications has no sidebar entry for any role — the header notification
 * bell's "View all" is the only nav path to /notifications (see NotificationCenter). This is
 * presentation only: the actual access control lives in route guards (AppRouter/ProtectedRoute)
 * and backend [Authorize] attributes, since hiding a link never stops someone from typing the
 * URL directly.
 */
const buildViewerNavGroups = (): NavGroup[] => [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Viewer'] }],
  },
  {
    label: 'Workspace',
    items: [
      { name: 'My Activity', icon: 'history', path: '/activities', roles: ['Viewer'] },
      { name: 'My Teams', icon: 'diversity_3', path: '/my-teams', roles: ['Viewer'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'My Access', icon: 'verified_user', path: '/access', roles: ['Viewer'] },
      { name: 'Settings', icon: 'settings', path: '/settings/profile', roles: ['Viewer'] },
    ],
  },
];

/**
 * Editor's own operations-focused IA — Viewer account management, Teams, operational activity
 * and reports, and personal account settings. No Roles/Permissions/API Keys/Integrations/Security
 * — those stay Admin-only surfaces (see buildAdminNavGroups).
 */
const buildEditorNavGroups = (): NavGroup[] => [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Editor'] }],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Users', icon: 'group', path: '/team', roles: ['Editor'] },
      { name: 'Teams', icon: 'diversity_3', path: '/teams', roles: ['Editor'] },
      { name: 'Activity', icon: 'history', path: '/activities', roles: ['Editor'] },
      { name: 'Reports', icon: 'monitoring', path: '/reports', roles: ['Editor'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'My Access', icon: 'verified_user', path: '/access', roles: ['Editor'] },
      { name: 'Settings', icon: 'settings', path: '/settings/profile', roles: ['Editor'] },
    ],
  },
];

/** Admin's full management nav — unchanged by the Viewer/Editor information-architecture work. */
const buildAdminNavGroups = (): NavGroup[] => [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['Admin'] }],
  },
  {
    label: 'Reports & Activity',
    items: [
      { name: 'Reports', icon: 'monitoring', path: '/reports', roles: ['Admin'] },
      { name: 'Activity', icon: 'history', path: '/activities', roles: ['Admin'] },
    ],
  },
  {
    label: 'Management',
    items: [
      { name: 'Users', icon: 'group', path: '/team', roles: ['Admin'] },
      { name: 'Roles', icon: 'shield_person', path: '/roles', roles: ['Admin'] },
      { name: 'Permissions', icon: 'key', path: '/permissions', roles: ['Admin'] },
      { name: 'Teams', icon: 'diversity_3', path: '/teams', roles: ['Admin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', icon: 'settings', path: '/settings/profile', roles: ['Admin'] },
      { name: 'API Keys', icon: 'vpn_key', path: '/settings/api-keys', roles: ['Admin'] },
      { name: 'Integrations', icon: 'hub', path: '/integrations', roles: ['Admin'] },
      { name: 'Security', icon: 'security', path: '/security', roles: ['Admin'] },
    ],
  },
];

const buildNavGroupsForRole = (role: string | null): NavGroup[] => {
  if (role === 'Viewer') return buildViewerNavGroups();
  if (role === 'Editor') return buildEditorNavGroups();
  return buildAdminNavGroups();
};

export const Sidebar = () => {
  const role = useCurrentRole();
  const dispatch = useDispatch();
  const isCollapsed = useSelector((state: RootState) => state.ui.isSidebarCollapsed);

  const navGroups = buildNavGroupsForRole(role);

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => role && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav
      className={`h-screen sticky left-0 top-0 shrink-0 bg-surface-container-lowest dark:bg-dark-surface-container-low border-r border-outline-variant/60 dark:border-dark-outline-variant flex-col py-5 hidden md:flex z-40 transition-[width] duration-150 ${isCollapsed ? 'w-[76px] px-2' : 'w-64 px-4'
        }`}
    >
      <div className={`mb-8 flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-2'}`}>
        <BrandLogo variant={isCollapsed ? 'mark' : 'full'} linkTo={null} />
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            {!isCollapsed && (
              <p className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant">
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
                    `density-nav-item rounded-md flex items-center gap-3 text-sm font-medium leading-none transition-colors ${isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
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
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`mt-3 flex items-center gap-2 rounded-md py-2 text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors ${isCollapsed ? 'justify-center px-0' : 'justify-start px-3'
          }`}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
        {!isCollapsed && 'Collapse'}
      </button>
    </nav>
  );
};
