interface PageTitleEntry {
  match: (pathname: string) => boolean;
  title: string;
  section?: string;
}

const ENTRIES: PageTitleEntry[] = [
  { match: (p) => p === '/dashboard', title: 'Dashboard' },
  { match: (p) => p === '/team', title: 'Users', section: 'Management' },
  { match: (p) => /^\/team\/[^/]+$/.test(p), title: 'User Detail', section: 'Management' },
  { match: (p) => p === '/roles', title: 'Roles', section: 'Management' },
  { match: (p) => /^\/roles\/[^/]+$/.test(p), title: 'Role Detail', section: 'Management' },
  { match: (p) => p === '/permissions', title: 'Permissions', section: 'Management' },
  { match: (p) => p === '/teams', title: 'Teams', section: 'Management' },
  { match: (p) => /^\/teams\/[^/]+$/.test(p), title: 'Team Detail', section: 'Management' },
  { match: (p) => p === '/activities', title: 'Activity' },
  { match: (p) => /^\/activities\/[^/]+$/.test(p), title: 'Activity Detail' },
  { match: (p) => p === '/reports', title: 'Reports Overview', section: 'Reports' },
  { match: (p) => p === '/reports/activity', title: 'Activity', section: 'Reports' },
  { match: (p) => p === '/reports/available', title: 'Available Reports', section: 'Reports' },
  { match: (p) => p === '/reports/security', title: 'Security Events', section: 'Reports' },
  { match: (p) => p === '/reports/permissions', title: 'Permission Reports', section: 'Reports' },
  { match: (p) => p === '/reports/exports', title: 'Export History', section: 'Reports' },
  { match: (p) => p === '/reports/scheduled', title: 'Scheduled Reports', section: 'Reports' },
  { match: (p) => p === '/settings/profile', title: 'Profile Settings', section: 'Settings' },
  { match: (p) => p === '/settings/account', title: 'Account Settings', section: 'Settings' },
  { match: (p) => p === '/settings/security', title: 'Security Settings', section: 'Settings' },
  { match: (p) => p === '/settings/appearance', title: 'Appearance', section: 'Settings' },
  { match: (p) => p === '/settings/notifications', title: 'Notification Preferences', section: 'Settings' },
  { match: (p) => p === '/settings/api-keys', title: 'API Keys', section: 'Settings' },
  { match: (p) => p === '/settings/integrations', title: 'Integrations', section: 'Settings' },
  { match: (p) => p === '/settings/audit', title: 'My Activity', section: 'Settings' },
  { match: (p) => p === '/security', title: 'Security Overview' },
  { match: (p) => p === '/security/sessions', title: 'Active Sessions', section: 'Security' },
  { match: (p) => p === '/security/access-reviews', title: 'Access Reviews', section: 'Security' },
  { match: (p) => p === '/integrations', title: 'Integrations' },
];

export const resolvePageTitle = (pathname: string): { title: string; section?: string } => {
  const entry = ENTRIES.find((candidate) => candidate.match(pathname));
  return entry ? { title: entry.title, section: entry.section } : { title: 'MyAdmin' };
};
