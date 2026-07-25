import { NavLink, Outlet, useSearchParams } from 'react-router-dom';

const TABS = [
  { label: 'Overview', to: '/reports', end: true },
  { label: 'Activity', to: '/reports/activity', end: false },
  { label: 'Security', to: '/reports/security', end: false },
  { label: 'Permissions', to: '/reports/permissions', end: false },
  { label: 'Exports', to: '/reports/exports', end: false },
  { label: 'Scheduled', to: '/reports/scheduled', end: false },
];

const SAVED_VIEWS = ['Default View', 'Last 7 Days · Failures Only', 'This Quarter · Admin Only'];

const ReportsLayout = () => {
  const [, setSearchParams] = useSearchParams();

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-7xl mx-auto w-full">
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Reports</h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            Build, review, and schedule reports across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            defaultValue="7d"
            className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
            aria-label="Date range"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="quarter">This quarter</option>
          </select>

          <select
            defaultValue={SAVED_VIEWS[0]}
            className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none max-w-[220px]"
            aria-label="Saved views"
          >
            {SAVED_VIEWS.map((view) => (
              <option key={view} value={view}>
                {view}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="inline-flex items-center gap-1.5 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant px-3 py-2 rounded-lg text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            Reset Filters
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant mb-6 overflow-x-auto">
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

      <Outlet />
    </div>
  );
};

export default ReportsLayout;
