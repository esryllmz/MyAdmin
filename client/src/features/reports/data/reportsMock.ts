export interface ExportHistoryEntry {
  id: string;
  fileName: string;
  format: 'CSV' | 'PDF' | 'XLSX';
  createdBy: string;
  createdDate: string;
  status: 'completed' | 'processing' | 'failed';
  sizeKb: number;
}

export const EXPORT_HISTORY: ExportHistoryEntry[] = [
  { id: 'exp-01', fileName: 'user-activity-2026-07', format: 'CSV', createdBy: 'esryllmz', createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'completed', sizeKb: 128 },
  { id: 'exp-02', fileName: 'security-events-2026-07', format: 'XLSX', createdBy: 'esryllmz', createdDate: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), status: 'completed', sizeKb: 342 },
  { id: 'exp-03', fileName: 'permission-matrix-q3', format: 'PDF', createdBy: 'gizem.arslan', createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', sizeKb: 96 },
  { id: 'exp-04', fileName: 'role-assignment-audit', format: 'CSV', createdBy: 'kaan.yildiz', createdDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'failed', sizeKb: 0 },
  { id: 'exp-05', fileName: 'system-usage-june', format: 'XLSX', createdBy: 'esryllmz', createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', sizeKb: 512 },
];

export interface ScheduledReportEntry {
  id: string;
  name: string;
  reportType: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  recipients: string[];
  nextRun: string;
  isActive: boolean;
}

export const SCHEDULED_REPORTS: ScheduledReportEntry[] = [
  { id: 'sch-01', name: 'Weekly Security Digest', reportType: 'Security Events', frequency: 'Weekly', recipients: ['esryllmz@myadmin.dev'], nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), isActive: true },
  { id: 'sch-02', name: 'Monthly Permission Review', reportType: 'Permission Changes', frequency: 'Monthly', recipients: ['esryllmz@myadmin.dev', 'gizem.arslan@myadmin.dev'], nextRun: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), isActive: true },
  { id: 'sch-03', name: 'Daily Activity Snapshot', reportType: 'User Activity', frequency: 'Daily', recipients: ['esryllmz@myadmin.dev'], nextRun: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), isActive: false },
];

export const REPORT_TYPES = [
  'User Activity',
  'Role Assignment',
  'Permission Changes',
  'Security Events',
  'System Usage',
  'API Operations',
  'Notification Delivery',
] as const;
