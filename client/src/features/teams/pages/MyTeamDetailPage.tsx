import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMyTeam, useMyTeamMembers } from '../hooks/useTeams';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

type TabKey = 'overview' | 'membership' | 'members';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'membership', label: 'My Membership' },
  { key: 'members', label: 'Members' },
];

/**
 * Viewer's own team detail — read-only. Backend (GET /teams/mine/{id}) 404s unless the caller is
 * an active member, so reaching this page for a team you don't belong to fails the same way a
 * nonexistent team would (no membership-guessing signal). No mutation affordances are rendered:
 * Viewer has no Team management mandate (see TeamBusinessRules.ViewerMustBeActiveMemberAsync).
 */
const MyTeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useSearchParamState('tab', 'overview');

  const { data: team, isLoading, isError } = useMyTeam(id);
  const { data: members = [], isLoading: membersLoading } = useMyTeamMembers(id);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant dark:text-dark-on-surface-variant" />
      </div>
    );
  }

  if (isError || !team) {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full text-center py-24">
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Team not found.</p>
        <button onClick={() => navigate('/my-teams')} className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
          Back to My Teams
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-4xl mx-auto w-full">
      <button
        onClick={() => navigate('/my-teams')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        My Teams
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">{team.name}</h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            {team.description || 'No description.'}
          </p>
        </div>
        <span
          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${team.isActive ? 'bg-success/10 text-success' : 'bg-surface-dim dark:bg-dark-surface-dim text-on-surface-variant dark:text-dark-on-surface-variant'
            }`}
        >
          {team.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {!team.isActive && (
        <div className="mb-6 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 px-4 py-3 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          This team is currently inactive. It's shown here as read-only.
        </div>
      )}

      <div className="flex gap-1 border-b border-outline-variant/60 dark:border-dark-outline-variant mb-6 overflow-x-auto">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-3.5 pb-3 border-b-2 text-sm whitespace-nowrap transition-colors ${tab === tabItem.key
              ? 'border-on-surface dark:border-dark-on-surface text-on-surface dark:text-dark-on-surface font-semibold'
              : 'border-transparent text-on-surface-variant dark:text-dark-on-surface-variant font-medium hover:text-on-surface dark:hover:text-dark-on-surface'
              }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ['Team Name', team.name],
            ['Description', team.description || '—'],
            ['Status', team.isActive ? 'Active' : 'Inactive'],
            ['Member Count', String(team.memberCount)],
            ['Last Updated', team.updatedDate ? formatRelativeTime(team.updatedDate) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                {label}
              </p>
              <p className="text-sm text-on-surface dark:text-dark-on-surface mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'membership' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            ['Team Role', team.membershipRole],
            ['Joined Date', new Date(team.joinedDate).toLocaleDateString('en-US')],
            ['Membership Status', team.isActive ? 'Active' : 'Team Inactive'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                {label}
              </p>
              <p className="text-sm text-on-surface dark:text-dark-on-surface mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {membersLoading ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Loading...</p>
          ) : members.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              No members to show.
            </p>
          ) : (
            members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                    {member.profileImageUrl ? (
                      <img src={member.profileImageUrl} alt={member.username} className="w-full h-full object-cover" />
                    ) : (
                      member.username.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-on-surface dark:text-dark-on-surface truncate">
                    @{member.username}
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant px-2 py-0.5 rounded-full">
                  {member.membershipRole}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyTeamDetailPage;
