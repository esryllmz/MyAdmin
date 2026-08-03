import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTeams, useUpdateTeamStatus } from '../hooks/useTeams';
import { TeamFormModal } from '../components/TeamFormModal';
import { Skeleton } from '@/core/components/ui/skeleton';
import { useDebouncedSearchParam, useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const PAGE_SIZE = 12;

const TeamsPage = () => {
  const [search, setSearch] = useDebouncedSearchParam('q', { resetKeys: ['page'] });
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [pageParam, setPageParam] = useSearchParamState('page', '1');
  const page = Math.max(1, Number(pageParam) || 1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError } = useTeams({
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    pageSize: PAGE_SIZE,
  });
  const updateStatus = useUpdateTeamStatus();

  const teams = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Teams</h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            Create operational teams and manage Viewer memberships.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="shrink-0 bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus size={16} aria-hidden="true" />
          Create Team
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="w-full sm:w-72 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPageParam('1');
          }}
          className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Something went wrong loading teams. Please try again.
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant dark:text-dark-on-surface-variant">
          {search || statusFilter !== 'all' ? 'No teams match these filters.' : 'No teams yet — create one to get started.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <Link to={`/teams/${team.id}`} className="min-w-0">
                  <h3 className="text-base font-semibold text-on-surface dark:text-dark-on-surface hover:underline truncate">
                    {team.name}
                  </h3>
                </Link>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${team.isActive ? 'bg-success/10 text-success' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant'
                    }`}
                >
                  {team.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant leading-5 line-clamp-2 min-h-[2.5rem]">
                {team.description || 'No description.'}
              </p>
              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                <span>{team.memberCount} members · {team.managerCount} managers</span>
                <span>{formatRelativeTime(team.updatedDate ?? team.createdDate)}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/60 dark:border-dark-outline-variant mt-1">
                <Link
                  to={`/teams/${team.id}`}
                  className="flex-1 text-center text-xs font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high rounded-lg py-1.5 transition-colors"
                >
                  Manage Members
                </Link>
                <button
                  type="button"
                  onClick={() => updateStatus.mutate({ id: team.id, isActive: !team.isActive })}
                  disabled={updateStatus.isPending && updateStatus.variables?.id === team.id}
                  className="flex-1 text-center text-xs font-semibold text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high rounded-lg py-1.5 transition-colors disabled:opacity-50"
                >
                  {team.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalCount > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
            Page <span className="font-semibold text-on-surface dark:text-dark-on-surface">{page}</span> of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageParam(String(page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPageParam(String(page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <TeamFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default TeamsPage;
