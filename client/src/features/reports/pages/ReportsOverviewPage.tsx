import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { UserRegistrationChart, ActivityDistributionChart } from '@/features/dashboard/components/Charts';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useActivities, useMyActivities } from '@/features/activities/hooks/useActivities';
import { exportToCsv } from '@/core/utils/exportUtils';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const AdminReportsOverview = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: activities = [] } = useActivities();
  const { stats, chartData, isLoading } = useDashboardStats();

  const usersByRole = useMemo(
    () =>
      roles.map((role) => ({
        role: role.label || role.name,
        count: users.filter((user) => user.roles?.some((userRole) => userRole.id === role.id)).length,
      })),
    [roles, users]
  );

  const successRate = useMemo(() => {
    if (activities.length === 0) return 100;
    return Math.round((activities.filter((activity) => activity.isSuccess).length / activities.length) * 100);
  }, [activities]);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      if (usersByRole.every((row) => row.count === 0)) {
        toast.warning('There is no data to export.');
        return;
      }
      exportToCsv(
        usersByRole.map((row) => ({ Role: row.role, 'User Count': row.count })),
        'reports-overview-users-by-role'
      );
      toast.success('Report downloaded as CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest text-on-surface dark:text-dark-on-surface border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString('en-US')} subText="Registered users" icon="group" color="primary" isLoading={isLoading} />
        <StatCard title="Total Roles" value={stats.activeRoles.toLocaleString('en-US')} subText="Defined roles" icon="badge" color="secondary" isLoading={isLoading} />
        <StatCard title="Success Rate" value={`${successRate}%`} subText="Activity success rate" icon="check_circle" color="primary" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UserRegistrationChart data={chartData.userRegistration} isLoading={isLoading} />
        <ActivityDistributionChart data={chartData.activityDistribution} isLoading={isLoading} />
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">Users by Role</h3>
        {usersByRole.length === 0 ? (
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">No data yet.</p>
        ) : (
          <div className="space-y-2">
            {usersByRole.map((row) => (
              <div
                key={row.role}
                className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant"
              >
                <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{row.role}</span>
                <span className="text-sm font-bold text-on-surface dark:text-dark-on-surface">{row.count} users</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PersonalReportsOverview = () => {
  const { data: myActivities = [], isLoading } = useMyActivities();

  const recentActivity = useMemo(() => myActivities.slice(0, 5), [myActivities]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Available Reports" value="1" subText="Read-only" icon="description" color="primary" isLoading={isLoading} />
        <StatCard
          title="My Recent Activity"
          value={myActivities.length.toLocaleString('en-US')}
          subText="All time"
          icon="history"
          color="secondary"
          isLoading={isLoading}
        />
        <StatCard
          title="Recently Viewed"
          value={recentActivity.length.toLocaleString('en-US')}
          subText="Last 5 events"
          icon="visibility"
          color="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">My Activity Summary</h3>
          <Link
            to="/reports/activity"
            className="text-xs font-semibold text-on-surface-variant hover:text-on-surface dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface"
          >
            View all
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant"
              >
                <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{activity.action}</span>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatRelativeTime(activity.createdDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ReportsOverviewPage = () => {
  const { isAdmin } = useRolePermissions();
  return isAdmin ? <AdminReportsOverview /> : <PersonalReportsOverview />;
};

export default ReportsOverviewPage;
