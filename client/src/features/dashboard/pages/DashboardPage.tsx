import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { RootState } from '@/core/store/store';
import { StatCard } from '../components/StatCard';
import { LiveActivityFeed } from '@/features/activities/components/LiveActivityFeed';
import { SystemHealthPanel } from '../components/SystemHealthPanel';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { usePersonalDashboardStats } from '../hooks/usePersonalDashboardStats';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useCurrentRole } from '@/core/hooks/useCurrentRole';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import { exportToCsv } from '@/core/utils/exportUtils';
import { useManageableUsers } from '@/features/users/hooks/useUsers';
import { useMyTeams, useTeams } from '@/features/teams/hooks/useTeams';
import { useOperationalActivities } from '@/features/activities/hooks/useActivities';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

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
  const user = useSelector((state: RootState) => state.auth.user);
  const { recentActivityCount, unreadNotifications, activeSessions, recentActivities, isLoading } =
    usePersonalDashboardStats();
  const { data: myTeams = [] } = useMyTeams();

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
          Welcome back
        </h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Your account, your activity, your notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Link to="/access" className="block">
          <StatCard title="My Access" value={role ?? '—'} subText="Personal workspace · Read-only access" icon="badge" color="primary" />
        </Link>
        <Link to="/notifications" className="block">
          <StatCard
            title="Unread Notifications"
            value={unreadNotifications.toLocaleString('en-US')}
            subText={unreadNotifications > 0 ? 'Needs your attention' : 'All caught up'}
            icon="notifications"
            isLoading={isLoading}
          />
        </Link>
        <Link to="/settings/account" className="block">
          <StatCard
            title="Active Sessions"
            value={activeSessions.toLocaleString('en-US')}
            subText="This device"
            icon="devices"
          />
        </Link>
        <Link to="/activities" className="block">
          <StatCard
            title="Recent Activity"
            value={recentActivityCount.toLocaleString('en-US')}
            subText="Last 7 days"
            icon="history"
            isLoading={isLoading}
          />
        </Link>
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
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm mb-4">Account Security Summary</h3>
          <dl className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Account Status</dt>
              <dd className={`text-xs font-bold uppercase tracking-wide ${user?.isActive ? 'text-success' : 'text-error'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Current Session</dt>
              <dd className="text-xs font-medium text-on-surface dark:text-dark-on-surface">This device</dd>
            </div>
            {user?.createdDate && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Member Since</dt>
                <dd className="text-xs font-medium text-on-surface dark:text-dark-on-surface">
                  {new Date(user.createdDate).toLocaleDateString('en-US')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-5 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant overflow-hidden">
        <div className="p-5 border-b border-outline-variant/70 dark:border-dark-outline-variant flex items-center justify-between gap-3">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface">My Teams</h3>
          <Link to="/my-teams" className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
            View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
        {myTeams.length === 0 ? (
          <div className="min-h-[100px] flex flex-col items-center justify-center gap-2 text-center px-6 py-8">
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant max-w-xs">
              You are not a member of any teams yet.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/70 dark:divide-dark-outline-variant">
            {myTeams.slice(0, 3).map((team) => (
              <li key={team.id}>
                <Link
                  to={`/my-teams/${team.id}`}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-surface-container-high/40 dark:hover:bg-dark-surface-container-high/40 transition-colors"
                >
                  <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface truncate">{team.name}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant shrink-0">
                    {team.membershipRole}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Editor: an operations manager's view — Viewer accounts, Teams, and operational activity only. */
const EditorDashboard = () => {
  const { data: viewersPage, isLoading: viewersLoading } = useManageableUsers({ pageSize: 200 });
  const { data: teamsPage, isLoading: teamsLoading } = useTeams({ pageSize: 200 });
  const { data: operational = [], isLoading: activityLoading } = useOperationalActivities();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  const viewers = viewersPage?.items ?? [];
  const teams = teamsPage?.items ?? [];
  const isLoading = viewersLoading || teamsLoading || activityLoading || notificationsLoading;

  const activeViewers = viewers.filter((v) => v.isActive).length;
  const inactiveViewers = viewers.filter((v) => !v.isActive).length;
  const activeTeams = teams.filter((t) => t.isActive).length;
  const emptyTeams = teams.filter((t) => t.memberCount === 0).length;
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  // Captured once per mount (lazy initializer), not read impurely during render/memo.
  const [mountedAt] = useState(() => Date.now());

  const recentOperational = useMemo(() => {
    const cutoff = mountedAt - SEVEN_DAYS_MS;
    return operational.filter((a) => new Date(a.createdDate).getTime() >= cutoff);
  }, [operational, mountedAt]);

  const failedOperations = recentOperational.filter((a) => !a.isSuccess).length;
  const recentEvents = useMemo(() => operational.slice(0, 5), [operational]);
  const teamsOverview = useMemo(() => (teamsPage?.items ?? []).slice(0, 5), [teamsPage]);

  const hasAttentionItems = inactiveViewers > 0 || emptyTeams > 0 || failedOperations > 0;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
          Operations Overview
        </h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Manage Viewer accounts, teams, operational activity, and reports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <Link to="/team" className="block">
          <StatCard title="Managed Viewer Users" value={activeViewers.toLocaleString('en-US')} subText={`${viewers.length} total`} icon="group" color="primary" isLoading={isLoading} />
        </Link>
        <Link to="/teams" className="block">
          <StatCard title="Active Teams" value={activeTeams.toLocaleString('en-US')} subText={`${teams.length} total`} icon="diversity_3" color="secondary" isLoading={isLoading} />
        </Link>
        <Link to="/activities" className="block">
          <StatCard title="Recent User Changes" value={recentOperational.length.toLocaleString('en-US')} subText="Last 7 days" icon="history" color="primary" isLoading={isLoading} />
        </Link>
        <Link to="/notifications" className="block">
          <StatCard
            title="Unread Notifications"
            value={unreadNotifications.toLocaleString('en-US')}
            subText={unreadNotifications > 0 ? 'Needs your attention' : 'All caught up'}
            icon="notifications"
            isLoading={isLoading}
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 min-w-0 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant overflow-hidden">
          <div className="p-5 border-b border-outline-variant/70 dark:border-dark-outline-variant flex items-center justify-between gap-3">
            <h3 className="font-bold text-on-surface dark:text-dark-on-surface">Recent User Operations</h3>
            <Link to="/activities" className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
              View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          {recentEvents.length === 0 ? (
            <div className="min-h-42 flex flex-col items-center justify-center gap-2 text-center px-6 py-8">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant/25 dark:text-dark-on-surface-variant/25">history</span>
              <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant max-w-xs">
                Nothing here yet — Viewer account and team activity will show up as it happens.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/70 dark:divide-dark-outline-variant">
              {recentEvents.map((activity) => (
                <li key={activity.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{activity.newValues || activity.action}</span>
                  <span className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant shrink-0">
                    {formatRelativeTime(activity.createdDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="xl:col-span-1 min-w-0 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant overflow-hidden">
          <div className="p-5 border-b border-outline-variant/70 dark:border-dark-outline-variant flex items-center justify-between gap-3">
            <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm">Teams Overview</h3>
            <Link to="/teams" className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
              View all <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
          {teamsOverview.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              No teams yet.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/70 dark:divide-dark-outline-variant">
              {teamsOverview.map((team) => (
                <li key={team.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface truncate">{team.name}</p>
                    <p className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">{team.memberCount} members</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${team.isActive ? 'bg-success/10 text-success' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant'
                      }`}
                  >
                    {team.isActive ? 'Active' : 'Inactive'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {hasAttentionItems && (
        <div className="mt-5 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/70 dark:border-dark-outline-variant p-5">
          <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm mb-3">Attention Needed</h3>
          <ul className="space-y-2">
            {inactiveViewers > 0 && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant dark:text-dark-on-surface-variant">Inactive Viewer accounts</span>
                <Link to="/team?status=inactive" className="font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
                  {inactiveViewers}
                </Link>
              </li>
            )}
            {emptyTeams > 0 && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant dark:text-dark-on-surface-variant">Teams with no members</span>
                <Link to="/teams" className="font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
                  {emptyTeams}
                </Link>
              </li>
            )}
            {failedOperations > 0 && (
              <li className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant dark:text-dark-on-surface-variant">Failed operations (last 7 days)</span>
                <Link to="/reports/operations" className="font-semibold text-error hover:underline">
                  {failedOperations}
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { isAdmin, isEditor } = useRolePermissions();
  if (isAdmin) return <AdminDashboard />;
  if (isEditor) return <EditorDashboard />;
  return <PersonalDashboard />;
};

export default DashboardPage;
