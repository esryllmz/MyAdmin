import { useState } from 'react';
import { toast } from 'react-toastify';
import { SCHEDULED_REPORTS } from '../data/reportsMock';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

const ReportsScheduledPage = () => {
  const { isAdmin } = useRolePermissions();
  const [reports, setReports] = useState(SCHEDULED_REPORTS);

  const toggleActive = (id: string) => {
    if (!isAdmin) {
      toast.error('Zamanlanmış raporları yönetmek için Admin yetkisi gereklidir.');
      return;
    }
    setReports((current) =>
      current.map((report) => (report.id === id ? { ...report, isActive: !report.isActive } : report))
    );
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Zamanlanmış raporlar bu ortamda simüle edilir — gerçek e-posta teslimatı aktif değildir.
        </p>
        <button
          type="button"
          disabled={!isAdmin}
          title={isAdmin ? undefined : 'Bu işlem için Admin yetkisi gereklidir.'}
          className="bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Schedule
        </button>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
        {reports.map((report) => (
          <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">{report.name}</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                {report.reportType} · {report.frequency} · Next run {new Date(report.nextRun).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-[11px] text-on-surface-variant/70 dark:text-dark-on-surface-variant/70 mt-1">
                {report.recipients.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(report.id)}
              disabled={!isAdmin}
              title={isAdmin ? undefined : 'Bu işlem için Admin yetkisi gereklidir.'}
              className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none ${report.isActive
                  ? 'bg-success/10 text-success'
                  : 'bg-surface-container-high dark:bg-dark-surface-container-high text-on-surface-variant dark:text-dark-on-surface-variant'
                }`}
            >
              {report.isActive ? 'Active' : 'Paused'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsScheduledPage;
