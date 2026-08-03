import { useState, type FormEvent } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { useCreateViewerAccount } from '../hooks/useUsers';
import { isPasswordValid } from '@/features/auth/utils/authValidation';
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements';

interface CreateViewerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateTemporaryPassword = (): string => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!?*.';
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  const raw = [pick(upper), pick(lower), pick(digits), pick(special), pick(upper + lower + digits)]
    .concat(Array.from({ length: 6 }, () => pick(upper + lower + digits)))
    .join('');
  return raw
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Editor/Admin-only account creation — no role field is ever shown or sent; the backend always
 * assigns Viewer (see POST /api/users/viewers), so this can never mint an Editor or Admin
 * account regardless of what's submitted here.
 */
export const CreateViewerAccountModal = ({ isOpen, onClose }: CreateViewerAccountModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState(generateTemporaryPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);

  const createViewer = useCreateViewerAccount();

  const reset = () => {
    setUsername('');
    setEmail('');
    setTemporaryPassword(generateTemporaryPassword());
    setShowPassword(false);
    setCreatedUsername(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (createViewer.isPending || !isPasswordValid(temporaryPassword)) return;

    createViewer.mutate(
      { username, email, temporaryPassword },
      {
        onSuccess: (response) => {
          if (response.success) {
            setCreatedUsername(username);
          }
        },
      }
    );
  };

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(temporaryPassword);
    toast.success('Temporary password copied to clipboard.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Viewer Account</DialogTitle>
        </DialogHeader>

        {createdUsername ? (
          <div className="space-y-4">
            <p className="text-sm text-on-surface dark:text-dark-on-surface">
              <span className="font-semibold">@{createdUsername}</span> was created successfully. Share this
              temporary password with them now — it won't be shown again.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant bg-surface dark:bg-dark-surface px-3.5 py-2.5">
              <code className="flex-1 text-sm text-on-surface dark:text-dark-on-surface truncate">{temporaryPassword}</code>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
              >
                <Copy size={16} aria-hidden="true" />
              </button>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-2 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
                Username
              </label>
              <input
                autoFocus
                required
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
                  Temporary Password
                </label>
                <button
                  type="button"
                  onClick={() => setTemporaryPassword(generateTemporaryPassword())}
                  className="text-[10px] font-semibold text-on-surface dark:text-dark-on-surface hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={temporaryPassword}
                  onChange={(e) => setTemporaryPassword(e.target.value)}
                  className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant rounded-lg px-3.5 py-2 pr-10 text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordRequirements password={temporaryPassword} active={temporaryPassword.length > 0} />
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
                type="submit"
                disabled={createViewer.isPending || !username || !email || !isPasswordValid(temporaryPassword)}
                className="px-4 py-2 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createViewer.isPending ? 'Creating...' : 'Create Viewer Account'}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
