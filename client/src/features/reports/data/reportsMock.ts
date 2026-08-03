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
