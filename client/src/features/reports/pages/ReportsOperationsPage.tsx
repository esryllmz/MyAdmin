import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useOperationalActivities } from '@/features/activities/hooks/useActivities';
import { useTeams } from '@/features/teams/hooks/useTeams';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { exportToCsv } from '@/core/utils/exportUtils';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

/** Editor/Admin: Team creation, status, and membership events — never role/permission/API-key/security rows. */
const ReportsOperationsPage = () => {
  const [teamFilter, setTeamFilter] = useSearchParamState('team', 'all');
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [isExporting, setIsExporting] = useState(false);

  const { data: activities = [], isLoading } = useOperationalActivities({
    isSuccess: statusFilter === 'all' ? undefined : statusFilter === 'success',
  });
  const { data: teamsPage } = useTeams({ pageSize: 100 });
  const teams = useMemo(() => teamsPage?.items ?? [], [teamsPage]);

  const teamActivities = useMemo(
    () => activities.filter((a) => a.entityName === 'Team' || a.entityName === 'TeamMember'),
    [activities]
  );

  const filtered = useMemo(
    () => teamActivities.filter((a) => teamFilter === 'all' || a.entityId === teamFilter),
    [teamActivities, teamFilter]
  );

  const teamNameById = useMemo(() => new Map(teams.map((t) => [t.id, t.name])), [teams]);

  const handleExport = () => {
    if (!filtered.length) {
      toast.warning('There is no data to export.');
      return;
    }
    setIsExporting(true);
    try {
      exportToCsv(
        filtered.map((a) => ({
          Team: teamNameById.get(a.entityId ?? '') ?? a.entityId ?? '—',
          Action: a.action,
          Actor: a.userName ?? 'System',
          Status: a.isSuccess ? 'Success' : 'Failed',
          Date: a.createdDate,
        })),
        'team-operations'
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
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
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
          disabled={isExporting || !filtered.length}
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
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Team</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Event</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Actor</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">Status</th>
                <th className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    No team operations match these filters.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((activity) => (
                  <tr key={activity.id} className="hover:bg-surface-container-high/30 dark:hover:bg-dark-surface-container-high/30">
                    <td className="px-5 py-3 text-on-surface dark:text-dark-on-surface font-medium">
                      {teamNameById.get(activity.entityId ?? '') ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {activity.newValues || activity.action}
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {activity.userName ?? 'System'}
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

export default ReportsOperationsPage;
