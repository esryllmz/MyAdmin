import { EXPORT_HISTORY } from '../data/reportsMock';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-success/10 text-success',
  processing: 'bg-warning/10 text-warning',
  failed: 'bg-error/10 text-error',
};

const ReportsExportsPage = () => {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Geçmiş dışa aktarma işlemleri — demo ortamında görüntülenir.
        </p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">File</th>
                <th className="px-5 py-3.5">Format</th>
                <th className="px-5 py-3.5">Created By</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5">Size</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {EXPORT_HISTORY.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-5 py-3 font-medium text-on-surface dark:text-dark-on-surface">{entry.fileName}</td>
                  <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{entry.format}</td>
                  <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{entry.createdBy}</td>
                  <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                    {formatRelativeTime(entry.createdDate)}
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                    {entry.sizeKb > 0 ? `${entry.sizeKb} KB` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[entry.status]}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      disabled={entry.status !== 'completed'}
                      title={entry.status === 'completed' ? 'İndir' : 'Bu ortamda gerçek dosya üretimi aktif değil'}
                      className="text-xs font-semibold text-on-surface dark:text-dark-on-surface hover:underline disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsExportsPage;
