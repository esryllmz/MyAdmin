import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { exportToCsv } from '@/core/utils/exportUtils';
import type { RootState } from '@/core/store/store';

const AccountSettingsTab = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const handleExportData = () => {
    if (!user) return;
    exportToCsv(
      [{ Kullanici: user.username, Email: user.email, KatilimTarihi: user.createdDate }],
      'account-data-export'
    );
    toast.success('Hesap verileriniz CSV olarak indirildi.');
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <div>
          <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Account Status</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">Hesabınız aktif durumda.</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-success/10 text-success px-2 py-1 rounded">
          Active
        </span>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">Login Email</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">{user?.email}</p>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Password Management</p>
        <button
          type="button"
          onClick={() => toast.info('Şifre değiştirme akışı bu ortamda simüle edilmiştir.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          Change Password
        </button>
      </div>

      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-5">
        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface mb-2">Session Management</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-3">
          Aktif oturumlarınızı Security &gt; Sessions üzerinden yönetin.
        </p>
        <a
          href="/security/sessions"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors"
        >
          View Sessions
        </a>
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
        <p className="text-sm font-medium text-error mb-2">Deactivate Account</p>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-3">
          Bu işlem geri alınamaz ve Admin onayı gerektirir.
        </p>
        <button
          type="button"
          onClick={() => toast.warning('Hesap deaktivasyonu bu ortamda devre dışıdır.')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-error hover:bg-error/10 transition-colors"
        >
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default AccountSettingsTab;
