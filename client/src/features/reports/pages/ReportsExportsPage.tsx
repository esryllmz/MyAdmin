import { useRolePermissions } from '@/core/hooks/useRolePermissions';

/**
 * Honest placeholder: MyAdmin's CSV exports (exportToCsv) generate a client-side download
 * immediately — there is no backend job/file-history to list here. Rather than fabricate an
 * export history table, this says so plainly instead of showing fake completed/processing rows.
 */
const ReportsExportsPage = () => {
  const { isAdmin } = useRolePermissions();

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-10 text-center">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 dark:text-dark-on-surface-variant/30">
        cloud_off
      </span>
      <p className="mt-3 text-sm font-medium text-on-surface dark:text-dark-on-surface">Export history isn't tracked yet</p>
      <p className="mt-1.5 text-xs text-on-surface-variant dark:text-dark-on-surface-variant max-w-md mx-auto">
        {isAdmin
          ? 'CSV exports across the app download directly to your device — there is no server-side export job history to list yet.'
          : 'Your CSV exports download directly to your device — there is no server-side export history to list yet.'}
      </p>
    </div>
  );
};

export default ReportsExportsPage;
