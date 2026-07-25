export interface TeamMemberRef {
  username: string;
  role: string;
}

export interface TeamEntry {
  id: string;
  name: string;
  description: string;
  members: TeamMemberRef[];
  createdDate: string;
}

export const TEAMS: TeamEntry[] = [
  {
    id: 'team-platform',
    name: 'Platform Engineering',
    description: 'Owns the API, database, and core infrastructure.',
    members: [
      { username: 'esryllmz', role: 'Admin' },
      { username: 'kaan.yildiz', role: 'Editor' },
    ],
    createdDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'team-security',
    name: 'Security & Compliance',
    description: 'Reviews access, audits, and incident response.',
    members: [
      { username: 'gizem.arslan', role: 'Editor' },
      { username: 'esryllmz', role: 'Admin' },
    ],
    createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'team-support',
    name: 'Customer Support',
    description: 'Front-line access to user accounts for support cases.',
    members: [{ username: 'aylin.polat', role: 'Viewer' }],
    createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
