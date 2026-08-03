import { NavLink, Outlet } from 'react-router-dom';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

interface SettingsNavItem {
  label: string;
  to: string;
  editorOnly?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: SettingsNavItem[] = [
  { label: 'Profile', to: '/settings/profile' },
  { label: 'Account', to: '/settings/account' },
  { label: 'Security', to: '/settings/security' },
  { label: 'Appearance', to: '/settings/appearance' },
  { label: 'Notifications', to: '/settings/notifications' },
  { label: 'My Activity', to: '/settings/audit', editorOnly: true },
  { label: 'API Keys', to: '/settings/api-keys', editorOnly: true },
  { label: 'Integrations', to: '/settings/integrations', adminOnly: true },
];

const SettingsLayout = () => {
  const { isAdmin, isEditor } = useRolePermissions();
  const items = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.editorOnly) return isAdmin || isEditor;
    return true;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight mb-2">Settings</h2>
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-sm">
          Manage your account and preferences.
        </p>
      </div>

      <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant mb-8 overflow-x-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3.5 pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${isActive
                ? 'border-on-surface dark:border-dark-on-surface text-on-surface dark:text-dark-on-surface font-semibold'
                : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant font-medium hover:text-on-surface dark:hover:text-dark-on-surface'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="density-card bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-6 border border-outline-variant/60 dark:border-dark-outline-variant">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
