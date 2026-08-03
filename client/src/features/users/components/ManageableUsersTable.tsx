import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useManageableUsers, useUpdateUserStatus } from '../hooks/useUsers';
import { Skeleton } from '@/core/components/ui/skeleton';
import { useDebouncedSearchParam, useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const PAGE_SIZE = 10;

/**
 * Editor's Users list — server-scoped to Viewer accounts only (GET /users/manageable). No role
 * column/selector and no delete action: Editor can't reassign roles or delete accounts (see
 * useRolePermissions ACTION_REQUIREMENT — both are Admin-only), so those controls simply aren't
 * rendered here rather than shown disabled.
 */
export const ManageableUsersTable = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useDebouncedSearchParam('q', { resetKeys: ['page'] });
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [pageParam, setPageParam] = useSearchParamState('page', '1');
  const page = Math.max(1, Number(pageParam) || 1);

  const { data, isLoading, isError } = useManageableUsers({
    search: search || undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    pageSize: PAGE_SIZE,
  });
  const updateStatus = useUpdateUserStatus();

  const users = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleToggleStatus = (id: string, isActive: boolean) => {
    updateStatus.mutate({ id, isActive: !isActive });
  };

  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="p-5 border-b border-outline-variant/60 dark:border-dark-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-low/30 dark:bg-dark-surface-container-low/30">
          <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-error/5 border border-error/20 rounded-xl p-10 text-center">
        <p className="text-on-surface dark:text-dark-on-surface font-medium">Something went wrong loading Viewer accounts.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
      <div className="p-5 border-b border-outline-variant/60 dark:border-dark-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-low/30 dark:bg-dark-surface-container-low/30">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 dark:text-dark-on-surface-variant/60 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Viewer accounts..."
            className="w-full pl-10 pr-4 py-2 bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm text-on-surface dark:text-dark-on-surface focus:outline-none focus:border-outline dark:focus:border-dark-outline transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageParam('1');
            }}
            className="bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg text-sm px-3 py-2 text-on-surface dark:text-dark-on-surface outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant shrink-0">
            <span className="font-semibold text-on-surface dark:text-dark-on-surface">{totalCount}</span> Viewer{totalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4 border-b border-outline-variant/60 dark:border-dark-outline-variant">User</th>
              <th className="px-6 py-4 border-b border-outline-variant/60 dark:border-dark-outline-variant">Status</th>
              <th className="px-6 py-4 border-b border-outline-variant/60 dark:border-dark-outline-variant">Created</th>
              <th className="px-6 py-4 border-b border-outline-variant/60 dark:border-dark-outline-variant">Last Updated</th>
              <th className="px-6 py-4 border-b border-outline-variant/60 dark:border-dark-outline-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-high/40 dark:hover:bg-dark-surface-container-high/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt={user.username} className="w-9 h-9 rounded-full object-cover border border-outline-variant dark:border-dark-outline-variant" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface flex items-center justify-center font-bold text-xs border border-outline-variant dark:border-dark-outline-variant">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-on-surface dark:text-dark-on-surface">@{user.username}</span>
                        <span className="text-[11px] text-on-surface-variant/80 dark:text-dark-on-surface-variant/80">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={updateStatus.isPending && updateStatus.variables?.id === user.id}
                      className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Toggle status"
                    >
                      {updateStatus.isPending && updateStatus.variables?.id === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-on-surface-variant dark:text-dark-on-surface-variant" />
                      ) : (
                        <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-success' : 'bg-outline dark:bg-dark-outline'}`}></span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight transition-colors ${user.isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                        }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant dark:text-dark-on-surface-variant">
                    {new Date(user.createdDate).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant dark:text-dark-on-surface-variant">
                    {formatRelativeTime(user.updatedDate ?? user.createdDate)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/team/${user.id}`)}
                      className="inline-flex items-center gap-1.5 text-on-surface dark:text-dark-on-surface hover:text-on-surface-variant dark:hover:text-dark-on-surface-variant font-semibold text-xs px-4 py-2 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 dark:text-dark-on-surface-variant/20">person_off</span>
                    <p className="text-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                      {search || statusFilter !== 'all' ? 'No Viewer accounts match these filters.' : 'No Viewer accounts yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalCount > 0 && (
        <div className="px-5 py-3 border-t border-outline-variant/60 dark:border-dark-outline-variant flex items-center justify-between bg-surface-container-low/30 dark:bg-dark-surface-container-low/30">
          <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
            Page <span className="font-semibold text-on-surface dark:text-dark-on-surface">{page}</span> of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageParam(String(page - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPageParam(String(page + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
