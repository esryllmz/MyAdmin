import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  useDeleteTeam,
  useRemoveTeamMember,
  useTeam,
  useTeamActivities,
  useTeamMembers,
  useUpdateTeamMember,
  useUpdateTeamStatus,
} from '../hooks/useTeams';
import { TeamFormModal } from '../components/TeamFormModal';
import { AddTeamMemberModal } from '../components/AddTeamMemberModal';
import { TEAM_MEMBERSHIP_ROLES, type TeamMembershipRole } from '../types/teamTypes';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import { Skeleton } from '@/core/components/ui/skeleton';

type TabKey = 'overview' | 'members' | 'activity' | 'settings';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'members', label: 'Members' },
  { key: 'activity', label: 'Activity' },
  { key: 'settings', label: 'Settings' },
];

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, can } = useRolePermissions();
  const [tab, setTab] = useSearchParamState('tab', 'overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const { data: team, isLoading: teamLoading } = useTeam(id);
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(id);
  const { data: activities = [], isLoading: activitiesLoading } = useTeamActivities(id);

  const updateStatus = useUpdateTeamStatus();
  const removeMember = useRemoveTeamMember(id ?? '');
  const updateMember = useUpdateTeamMember(id ?? '');
  const deleteTeam = useDeleteTeam();

  const deleteTeamPermission = can('deleteTeam');

  if (teamLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant dark:text-dark-on-surface-variant" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 max-w-3xl mx-auto w-full text-center py-24">
        <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Team not found.</p>
        <button onClick={() => navigate('/teams')} className="mt-4 text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline">
          Back to Teams
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (!deleteTeamPermission.allowed || !id) return;
    if (!window.confirm(`Delete "${team.name}"? This can't be undone.`)) return;
    deleteTeam.mutate(id, { onSuccess: (res) => res.success && navigate('/teams') });
  };

  const handleRemoveMember = (userId: string, username: string) => {
    if (!window.confirm(`Remove @${username} from this team?`)) return;
    removeMember.mutate(userId);
  };

  const handleRoleChange = (userId: string, membershipRole: TeamMembershipRole) => {
    updateMember.mutate({ userId, request: { membershipRole } });
  };

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-5xl mx-auto w-full">
      <button
        onClick={() => navigate('/teams')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Teams
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-on-surface dark:text-dark-on-surface">{team.name}</h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
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
            ['Viewer Members', String(team.memberCount)],
            ['Managers', String(team.managerCount)],
            ['Created', new Date(team.createdDate).toLocaleDateString('en-US')],
            ['Last Updated', formatRelativeTime(team.updatedDate ?? team.createdDate)],
            ['Created By', team.createdByUsername ? `@${team.createdByUsername}` : '—'],
            ['Status', team.isActive ? 'Active' : 'Inactive'],
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
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus size={15} aria-hidden="true" />
              Add Member
            </button>
          </div>

          <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
            {membersLoading ? (
              <div className="space-y-2 p-5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : members.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
                No members yet.
              </p>
            ) : (
              <div className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
                {members.map((member) => {
                  const isNonViewer = member.applicationRole && member.applicationRole !== 'Viewer';
                  const canManage = isAdmin || !isNonViewer;
                  const roleOptions = isAdmin
                    ? TEAM_MEMBERSHIP_ROLES
                    : TEAM_MEMBERSHIP_ROLES.filter((role) => role !== 'Owner');

                  return (
                    <div key={member.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface truncate">
                          @{member.username}
                          {member.applicationRole && (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
                              {member.applicationRole}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant truncate">
                          {member.email} · joined {formatRelativeTime(member.joinedDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {canManage ? (
                          <select
                            value={member.membershipRole}
                            onChange={(e) => handleRoleChange(member.userId, e.target.value as TeamMembershipRole)}
                            disabled={updateMember.isPending}
                            className="bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface rounded-md text-[11px] font-bold uppercase tracking-wider px-2 py-1 outline-none focus:border-outline dark:focus:border-dark-outline disabled:opacity-50"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary-container dark:bg-dark-secondary-container text-on-secondary-container dark:text-dark-on-secondary-container px-2 py-1 rounded-md">
                            {member.membershipRole}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!canManage) {
                              toast.error('Editors can only manage Viewer team memberships.');
                              return;
                            }
                            handleRemoveMember(member.userId, member.username);
                          }}
                          disabled={!canManage || (removeMember.isPending && removeMember.variables === member.userId)}
                          title={canManage ? 'Remove from team' : 'Editors can only manage Viewer team memberships.'}
                          className="p-1.5 rounded-md text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-error/10 hover:text-error transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {activitiesLoading ? (
            <div className="space-y-2 p-5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              No recorded activity for this team yet.
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-on-surface dark:text-dark-on-surface">
                  {activity.newValues || activity.action}
                </span>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant shrink-0 ml-3">
                  {formatRelativeTime(activity.createdDate)}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-6 space-y-6 max-w-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Name &amp; Description</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">{team.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="text-xs font-semibold text-on-surface dark:text-dark-on-surface border border-outline-variant dark:border-dark-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Team Status</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                {team.isActive ? 'Active — visible in operational lists.' : 'Inactive — hidden from active team lists.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => id && updateStatus.mutate({ id, isActive: !team.isActive })}
              disabled={updateStatus.isPending}
              className="text-xs font-semibold text-on-surface dark:text-dark-on-surface border border-outline-variant dark:border-dark-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-50"
            >
              {team.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between border-t border-outline-variant/60 dark:border-dark-outline-variant pt-5">
              <div>
                <p className="text-sm font-medium text-error">Delete Team</p>
                <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                  Permanently deletes this team and its memberships.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteTeam.isPending}
                className="text-xs font-semibold text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      <TeamFormModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} team={team} />
      {id && (
        <AddTeamMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          teamId={id}
          existingMembers={members}
        />
      )}
    </div>
  );
};

export default TeamDetailPage;
