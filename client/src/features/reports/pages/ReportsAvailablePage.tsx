import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface AvailableReport {
  name: string;
  description: string;
  lastUpdated: string;
  format: string;
  accessLevel: string;
  to: string;
}

const AVAILABLE_REPORTS: AvailableReport[] = [
  {
    name: 'My Activity Report',
    description: 'A chronological record of the actions taken on your own account — logins, profile changes, and more.',
    lastUpdated: 'Live',
    format: 'In-app / CSV',
    accessLevel: 'Personal',
    to: '/reports/activity',
  },
];

const ReportsAvailablePage = () => {
  return (
    <div>
      <p className="mb-6 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
        Reports you have access to. More report types are added as they become available to your role.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AVAILABLE_REPORTS.map((report) => (
          <Link
            key={report.name}
            to={report.to}
            className="group rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 transition-colors hover:border-outline dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest dark:hover:border-dark-outline"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">{report.name}</h3>
              <ArrowRight
                size={16}
                className="mt-0.5 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5 dark:text-dark-on-surface-variant"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1.5 text-xs leading-5 text-on-surface-variant dark:text-dark-on-surface-variant">
              {report.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">
              <span>Updated: {report.lastUpdated}</span>
              <span>Format: {report.format}</span>
              <span>Access: {report.accessLevel}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReportsAvailablePage;
