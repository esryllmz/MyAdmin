import { useState, type FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams';
import type { TeamResponseDto } from '../types/teamTypes';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: TeamResponseDto | null;
  onCreated?: (id: string) => void;
}

interface TeamFormFieldsProps {
  team?: TeamResponseDto | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

/**
 * Mounted only while the dialog is open (see `key` below) — local state initializes straight
 * from the `team` prop, so switching between "create" and "edit team X" never needs an effect
 * to resync state after the fact.
 */
const TeamFormFields = ({ team, onClose, onCreated }: TeamFormFieldsProps) => {
  const [name, setName] = useState(team?.name ?? '');
  const [description, setDescription] = useState(team?.description ?? '');

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam(team?.id ?? '');
  const isPending = createTeam.isPending || updateTeam.isPending;
  const isDirty = team ? name !== team.name || description !== (team.description ?? '') : name.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isPending) return;

    if (team) {
      updateTeam.mutate(
        { name: name.trim(), description: description.trim() || null },
        { onSuccess: (res) => res.success && onClose() }
      );
    } else {
      createTeam.mutate(
        { name: name.trim(), description: description.trim() || null },
        {
          onSuccess: (res) => {
            if (res.success) {
              onCreated?.(res.data!.id);
              onClose();
            }
          },
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
          Name
        </label>
        <input
          autoFocus
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
          Description
        </label>
        <textarea
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all resize-none"
        />
      </div>

      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isPending || !isDirty}
          className="px-4 py-2 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : team ? 'Save Changes' : 'Create Team'}
        </button>
      </DialogFooter>
    </form>
  );
};

/** Same modal handles create and edit — team presence decides the mode and the mutation used. */
export const TeamFormModal = ({ isOpen, onClose, team, onCreated }: TeamFormModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? 'Edit Team' : 'Create Team'}</DialogTitle>
        </DialogHeader>

        {isOpen && (
          <TeamFormFields key={team?.id ?? 'create'} team={team} onClose={onClose} onCreated={onCreated} />
        )}
      </DialogContent>
    </Dialog>
  );
};
