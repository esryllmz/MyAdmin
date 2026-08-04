import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useMyTeams } from '../hooks/useTeams';
import { Skeleton } from '@/core/components/ui/skeleton';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

/**
 * Viewer's own Team membership — server-scoped to the caller's active memberships (see
 * TeamService.GetMyTeamsAsync / GET /teams/mine). No create/edit/delete affordances; this is a
 * read-only view of teams the Viewer already belongs to.
 */
const MyTeamsPage = () => {
  const { data: teams = [], isLoading, isError } = useMyTeams();

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">My Teams</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Teams you're a member of.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Something went wrong loading your teams. Please try again.
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 text-center py-24">
          <Users className="w-8 h-8 text-on-surface-variant/30 dark:text-dark-on-surface-variant/30" aria-hidden="true" />
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            You are not a member of any teams yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/my-teams/${team.id}`}
              className="rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6 flex flex-col gap-3 hover:bg-surface-container-low/60 dark:hover:bg-dark-surface-container-low/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-on-surface dark:text-dark-on-surface truncate">
                  {team.name}
                </h3>
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
              <div className="flex items-center justify-between text-xs text-on-surface-variant dark:text-dark-on-surface-variant pt-2 border-t border-outline-variant/60 dark:border-dark-outline-variant">
                <span className="inline-flex items-center gap-1.5 font-semibold text-on-surface dark:text-dark-on-surface">
                  {team.membershipRole}
                </span>
                <span>Joined {formatRelativeTime(team.joinedDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTeamsPage;
