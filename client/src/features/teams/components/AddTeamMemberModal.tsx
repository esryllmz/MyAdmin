import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { useManageableUsers } from '@/features/users/hooks/useUsers';
import { useAddTeamMember } from '../hooks/useTeams';
import { TEAM_MEMBERSHIP_ROLES, type TeamMembershipRole, type TeamMemberResponseDto } from '../types/teamTypes';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  existingMembers: TeamMemberResponseDto[];
}

/**
 * Editor's picker only ever offers Viewer accounts (GET /users/manageable) — there is no path
 * in this UI to select an Admin or Editor as a member, matching the backend's
 * EditorMayOnlyTargetViewerMembers guard.
 */
export const AddTeamMemberModal = ({ isOpen, onClose, teamId, existingMembers }: AddTeamMemberModalProps) => {
  const { isAdmin } = useRolePermissions();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [membershipRole, setMembershipRole] = useState<TeamMembershipRole>('Member');

  const { data, isLoading } = useManageableUsers({ search: search || undefined, isActive: true, pageSize: 20 });
  const addMember = useAddTeamMember(teamId);

  const existingIds = useMemo(() => new Set(existingMembers.map((m) => m.userId)), [existingMembers]);
  const candidates = (data?.items ?? []).filter((user) => !existingIds.has(user.id));

  const availableRoles = isAdmin ? TEAM_MEMBERSHIP_ROLES : TEAM_MEMBERSHIP_ROLES.filter((role) => role !== 'Owner');

  const reset = () => {
    setSearch('');
    setSelectedUserId(null);
    setMembershipRole('Member');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedUserId || addMember.isPending) return;
    addMember.mutate(
      { userId: selectedUserId, membershipRole },
      { onSuccess: (res) => res.success && handleClose() }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
              Viewer Account
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedUserId(null);
              }}
              placeholder="Search Viewer accounts..."
              className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
            />
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {isLoading ? (
                <p className="px-3.5 py-4 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Loading...</p>
              ) : candidates.length === 0 ? (
                <p className="px-3.5 py-4 text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  No matching Viewer accounts.
                </p>
              ) : (
                candidates.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${selectedUserId === user.id
                      ? 'bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface font-semibold'
                      : 'text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                      }`}
                  >
                    @{user.username} <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{user.email}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
              Team Role
            </label>
            <select
              value={membershipRole}
              onChange={(e) => setMembershipRole(e.target.value as TeamMembershipRole)}
              className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedUserId || addMember.isPending}
            className="px-4 py-2 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addMember.isPending ? 'Adding...' : 'Add Member'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
