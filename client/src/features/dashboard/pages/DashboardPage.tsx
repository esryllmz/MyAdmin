import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatCard } from '../components/StatCard';
import { LiveActivityFeed } from '@/features/activities/components/LiveActivityFeed';
import { SystemHealthPanel } from '../components/SystemHealthPanel';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { usePersonalDashboardStats } from '../hooks/usePersonalDashboardStats';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useCurrentRole } from '@/core/hooks/useCurrentRole';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import { exportToCsv } from '@/core/utils/exportUtils';

const AdminDashboard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { stats, isLoading, isDemoMode } = useDashboardStats();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = [
        { Metric: 'Total Users', Value: stats.totalUsers, Date: new Date().toLocaleDateString('en-US') },
        { Metric: 'Active Roles', Value: stats.activeRoles, Date: new Date().toLocaleDateString('en-US') },
        { Metric: "Today's Notifications", Value: stats.todayNotifications, Date: new Date().toLocaleDateString('en-US') },
        { Metric: 'Recent Failed Activities', Value: stats.recentFailedActivities, Date: new Date().toLocaleDateString('en-US') },
      ];
      exportToCsv(exportData, 'dashboard-stats');
      toast.success('Dashboard data exported as CSV.');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Something went wrong while exporting.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
            System Overview
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{isDemoMode ? 'Live simulation over demo data.' : 'Recent activity and current system state.'}</span>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-info shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info"></span>
                </span>
                Demo
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="shrink-0 bg-surface-container-lowest dark:bg-dark-surface-container-low border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2 rounded-lg text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExporting ? 'hourglass_empty' : 'download'}
          </span>
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString('en-US')} subText="Registered users" icon="group" color="primary" isLoading={isLoading} />
        <StatCard title="Active Roles" value={stats.activeRoles.toLocaleString('en-US')} subText="Defined roles" icon="badge" color="secondary" isLoading={isLoading} />
        <StatCard
          title="Today's Notifications"
          value={stats.todayNotifications.toLocaleString('en-US')}
          badge={`${stats.unreadNotifications} UNREAD`}
          icon="notifications"
          isLoading={isLoading}
        />
        <StatCard title="Recent Failed Activities" value={stats.recentFailedActivities.toLocaleString('en-US')} subText="Requires review" icon="warning" color="error" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 min-w-0">
          <LiveActivityFeed />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <SystemHealthPanel />
        </div>
      </div>
    </div>
  );
};

/** Editor/Viewer: personal-only dashboard — no system-wide metrics, no infrastructure detail. */
const PersonalDashboard = () => {
  const role = useCurrentRole();
  const { recentActivityCount, unreadNotifications, recentActivities, isLoading } = usePersonalDashboardStats();

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
          Welcome back
        </h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Your account, your activity, your reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard title="My Access" value={role ?? '—'} subText="Read-only access" icon="badge" color="primary" />
        <StatCard
          title="Unread Notifications"
          value={unreadNotifications.toLocaleString('en-US')}
          subText={unreadNotifications > 0 ? 'Needs your attention' : 'All caught up'}
          icon="notifications"
          isLoading={isLoading}
        />
        <StatCard
          title="My Recent Activity"
          value={recentActivityCount.toLocaleString('en-US')}
          subText="Last 7 days"
          icon="history"
          isLoading={isLoading}
        />
        <StatCard title="Available Reports" value="1" subText="Read-only" icon="description" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 min-w-0 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant overflow-hidden">
          <div className="p-5 border-b border-outline-variant/70 dark:border-dark-outline-variant flex items-center justify-between gap-3">
            <h3 className="font-bold text-on-surface dark:text-dark-on-surface">Recent Activity</h3>
            <Link to="/activities" className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
              View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <div className="min-h-[168px] flex flex-col items-center justify-center gap-2 text-center px-6 py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/25 dark:text-dark-on-surface-variant/25">history</span>
              <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant max-w-xs">
                Nothing here yet — your account activity will show up as you use the workspace.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/70 dark:divide-dark-outline-variant">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{activity.action}</span>
                  <span className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant shrink-0">
                    {formatRelativeTime(activity.createdDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="xl:col-span-1 min-w-0 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-6">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm mb-1">Service Status</h3>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-5">
            Workspace availability.
          </p>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-success shrink-0" />
            <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Available</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { isAdmin } = useRolePermissions();
  return isAdmin ? <AdminDashboard /> : <PersonalDashboard />;
};

export default DashboardPage;
