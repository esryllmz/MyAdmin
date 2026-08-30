import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { KeyRound, Monitor } from 'lucide-react';
import { exportToCsv } from '@/core/utils/exportUtils';
import { userService } from '@/features/users/services/userService';
import { authService } from '@/features/auth/services/authService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthPasswordField } from '@/features/auth/components/AuthPasswordField';
import { PasswordRequirements } from '@/features/auth/components/PasswordRequirements';
import { isPasswordValid, validateConfirmPassword } from '@/features/auth/utils/authValidation';
import { useMyActivities } from '@/features/activities/hooks/useActivities';
import type { RootState } from '@/core/store/store';

const ChangePasswordForm = ({ onDone }: { onDone: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const mutation = useMutation({
    mutationFn: () =>
      userService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      }),
    onSuccess: (response) => {
      if (response.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onDone();
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mutation.isPending) return;

    const nextErrors = {
      current: currentPassword ? undefined : 'Enter your current password.',
      next: isPasswordValid(newPassword) ? undefined : "Password doesn't meet the requirements below.",
      confirm: validateConfirmPassword(newPassword, confirmPassword),
    };
    setErrors(nextErrors);
    if (nextErrors.current || nextErrors.next || nextErrors.confirm) return;

    mutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-4 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant p-4">
      <AuthPasswordField
        id="currentPassword"
        label="Current Password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        error={errors.current}
      />
      <div>
        <AuthPasswordField
          id="newPassword"
          label="New Password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.next}
        />
        <PasswordRequirements password={newPassword} active={newPassword.length > 0} />
      </div>
      <AuthPasswordField
        id="confirmNewPassword"
        label="Confirm New Password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirm}
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {mutation.isPending ? 'Updating...' : 'Update Password'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const AccountSettingsTab = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { logout } = useAuth();
  const { data: activities = [] } = useMyActivities();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleExportData = () => {
    if (!user) return;
    exportToCsv(
      [
        {
          Username: user.username,
          Email: user.email,
          JoinedDate: user.createdDate,
          RecordedActivityCount: activities.length,
        },
      ],
      'account-data-export'
    );
    toast.success('Your account data was downloaded as CSV.');
  };

  const handleRevokeCurrentSession = async () => {
    setIsRevoking(true);
    try {
      await authService.logout();
    } finally {
      logout();
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Account Status</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            {user?.isActive ? 'Your account is active.' : 'Your account is inactive.'}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded ${user?.isActive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}
        >
          {user?.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Login Email</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">{user?.email}</p>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Password Management</p>
        {isChangingPassword ? (
          <ChangePasswordForm onDone={() => setIsChangingPassword(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setIsChangingPassword(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
          >
            <KeyRound size={15} aria-hidden="true" />
            Change Password
          </button>
        )}
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Current Session</p>
        <div className="flex items-center justify-between rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low dark:bg-dark-surface-container-low">
              <Monitor size={16} className="text-on-surface-variant dark:text-dark-on-surface-variant" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">This device</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Signed in now</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRevokeCurrentSession}
            disabled={isRevoking}
            className="text-xs font-semibold text-error hover:underline disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-2">
          MyAdmin currently tracks a single active session per account — there's no multi-device
          session list to manage yet.
        </p>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Data Export</p>
        <button
          type="button"
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          Export My Data
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Account Deactivation</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          Self-service deactivation isn't available yet. To deactivate your account, contact your
          workspace administrator.
        </p>
      </div>
    </div>
  );
};

export default AccountSettingsTab;
