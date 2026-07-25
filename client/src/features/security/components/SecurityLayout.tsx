import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { label: 'Overview', to: '/security', end: true },
  { label: 'Sessions', to: '/security/sessions', end: false },
  { label: 'Access Reviews', to: '/security/access-reviews', end: false },
];

const SecurityLayout = () => {
  return (
    <div>
      <div className="px-6 md:px-8 lg:px-12 pt-6 max-w-6xl mx-auto w-full">
        <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant overflow-x-auto">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-3.5 pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${isActive
                  ? 'border-on-surface dark:border-dark-on-surface text-on-surface dark:text-dark-on-surface font-semibold'
                  : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant font-medium hover:text-on-surface dark:hover:text-dark-on-surface'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default SecurityLayout;
