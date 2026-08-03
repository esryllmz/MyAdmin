import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { UserRegistrationChart, ActivityDistributionChart } from '@/features/dashboard/components/Charts';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useUsers, useManageableUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useActivities, useOperationalActivities } from '@/features/activities/hooks/useActivities';
import { useTeams } from '@/features/teams/hooks/useTeams';
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

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const EditorReportsOverview = () => {
  const { data: viewersPage, isLoading: viewersLoading } = useManageableUsers({ pageSize: 200 });
  const { data: teamsPage, isLoading: teamsLoading } = useTeams({ pageSize: 200 });
  const { data: operational = [], isLoading: activityLoading } = useOperationalActivities();

  const viewers = viewersPage?.items ?? [];
  const teams = teamsPage?.items ?? [];
  const isLoading = viewersLoading || teamsLoading || activityLoading;

  const activeViewers = viewers.filter((v) => v.isActive).length;
  const inactiveViewers = viewers.length - activeViewers;
  const activeTeams = teams.filter((t) => t.isActive).length;

  // Captured once per mount (lazy initializer), not read impurely during render/memo.
  const [mountedAt] = useState(() => Date.now());

  const recentOperational = useMemo(() => {
    const cutoff = mountedAt - SEVEN_DAYS_MS;
    return operational.filter((a) => new Date(a.createdDate).getTime() >= cutoff);
  }, [operational, mountedAt]);

  const statusChanges = useMemo(
    () => recentOperational.filter((a) => a.action === 'ViewerStatusActivated' || a.action === 'ViewerStatusDeactivated').length,
    [recentOperational]
  );

  const recentEvents = useMemo(() => operational.slice(0, 5), [operational]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Active Viewer Users" value={activeViewers.toLocaleString('en-US')} subText={`${viewers.length} total`} icon="group" color="primary" isLoading={isLoading} />
        <StatCard title="Active Teams" value={activeTeams.toLocaleString('en-US')} subText={`${teams.length} total`} icon="diversity_3" color="secondary" isLoading={isLoading} />
        <StatCard title="Status Changes" value={statusChanges.toLocaleString('en-US')} subText="Last 7 days" icon="toggle_on" color="primary" isLoading={isLoading} />
        <StatCard title="Recent Operations" value={recentOperational.length.toLocaleString('en-US')} subText="Last 7 days" icon="history" color="secondary" isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Recent Operations</h3>
            <Link
              to="/reports/activity"
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface"
            >
              View all
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">No activity yet.</p>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant"
                >
                  <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{activity.newValues || activity.action}</span>
                  <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant shrink-0 ml-3">
                    {formatRelativeTime(activity.createdDate)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6">
          <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface mb-4">Viewer Status Distribution</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant">
              <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Active</span>
              <span className="text-sm font-bold text-success">{activeViewers}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant">
              <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Inactive</span>
              <span className="text-sm font-bold text-on-surface-variant dark:text-dark-on-surface-variant">{inactiveViewers}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsOverviewPage = () => {
  const { isAdmin } = useRolePermissions();
  return isAdmin ? <AdminReportsOverview /> : <EditorReportsOverview />;
};

export default ReportsOverviewPage;
