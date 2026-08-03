import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useActivities, useOperationalActivities } from '@/features/activities/hooks/useActivities';
import { useManageableUsers } from '@/features/users/hooks/useUsers';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { exportToCsv } from '@/core/utils/exportUtils';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

const hashToMs = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 977;
  return 40 + (hash % 420);
};

/** Admin-only: cross-user activity report (GET /activities). */
const GlobalActivityReport = () => {
  const { data: activities = [], isLoading } = useActivities();
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [entityFilter, setEntityFilter] = useSearchParamState('entity', 'all');
  const [isExporting, setIsExporting] = useState(false);

  const entityOptions = useMemo(
    () => Array.from(new Set(activities.map((activity) => activity.entityName))).sort(),
    [activities]
  );

  const filtered = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'success' && activity.isSuccess) ||
          (statusFilter === 'failed' && !activity.isSuccess);
        const matchesEntity = entityFilter === 'all' || activity.entityName === entityFilter;
        return matchesStatus && matchesEntity;
      }),
    [activities, statusFilter, entityFilter]
  );

  const handleExport = () => {
    if (!filtered.length) {
      toast.warning('There is no data to export.');
      return;
    }
    setIsExporting(true);
    try {
      exportToCsv(
        filtered.map((activity) => ({
          User: activity.userName ?? 'System',
          Action: activity.action,
          Entity: activity.entityName,
          Status: activity.isSuccess ? 'Success' : 'Failed',
          Date: activity.createdDate,
        })),
        'report-user-activity'
      );
      toast.success('Report downloaded.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Entities</option>
          {entityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2 rounded-lg text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">User</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Action</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Entity</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Response Time</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Status</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    No activity matches these filters.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((activity) => (
                  <tr key={activity.id} className="hover:bg-surface-container-high/30 dark:hover:bg-dark-surface-container-high/30">
                    <td className="px-5 py-3 text-on-surface dark:text-dark-on-surface font-medium">
                      {activity.userName ?? 'System'}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{activity.action}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{activity.entityName}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{hashToMs(activity.id)}ms</td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${activity.isSuccess ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                          }`}
                      >
                        {activity.isSuccess ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {formatRelativeTime(activity.createdDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/** Editor: Viewer account lifecycle events only (GET /activities/operations?entityName=User). */
const ViewerUserActivityReport = () => {
  const { data: activities = [], isLoading } = useOperationalActivities({ entityName: 'User' });
  const { data: viewersPage } = useManageableUsers({ pageSize: 200 });
  const [userFilter, setUserFilter] = useSearchParamState('user', 'all');
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [isExporting, setIsExporting] = useState(false);

  const viewers = viewersPage?.items ?? [];

  const filtered = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'success' && activity.isSuccess) ||
          (statusFilter === 'failed' && !activity.isSuccess);
        const matchesUser = userFilter === 'all' || activity.entityId === userFilter;
        return matchesStatus && matchesUser;
      }),
    [activities, statusFilter, userFilter]
  );

  const handleExport = () => {
    if (!filtered.length) {
      toast.warning('There is no data to export.');
      return;
    }
    setIsExporting(true);
    try {
      exportToCsv(
        filtered.map((activity) => ({
          Actor: activity.userName ?? 'System',
          Event: activity.action,
          Status: activity.isSuccess ? 'Success' : 'Failed',
          Date: activity.createdDate,
        })),
        'report-viewer-activity'
      );
      toast.success('Report downloaded.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Viewer Users</option>
          {viewers.map((viewer) => (
            <option key={viewer.id} value={viewer.id}>
              @{viewer.username}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>

        <div className="flex-1" />

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2 rounded-lg text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export
        </button>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Editor</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Event</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Status</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    No activity matches these filters.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((activity) => (
                  <tr key={activity.id} className="hover:bg-surface-container-high/30 dark:hover:bg-dark-surface-container-high/30">
                    <td className="px-5 py-3 text-on-surface dark:text-dark-on-surface font-medium">
                      {activity.userName ?? 'System'}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {activity.newValues || activity.action}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${activity.isSuccess ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                          }`}
                      >
                        {activity.isSuccess ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {formatRelativeTime(activity.createdDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportsActivityPage = () => {
  const { isAdmin } = useRolePermissions();

  return isAdmin ? <GlobalActivityReport /> : <ViewerUserActivityReport />;
};

export default ReportsActivityPage;
