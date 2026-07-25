export interface OrgSessionEntry {
  id: string;
  user: string;
  device: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const ORG_SESSIONS: OrgSessionEntry[] = [
  { id: 'osess-01', user: 'esryllmz', device: 'Chrome · Windows 11', ipAddress: '88.230.12.4', location: 'Istanbul, TR', lastActive: new Date(Date.now() - 2 * 60 * 1000).toISOString(), isCurrent: true },
  { id: 'osess-02', user: 'gizem.arslan', device: 'Firefox · macOS', ipAddress: '176.88.4.9', location: 'Ankara, TR', lastActive: new Date(Date.now() - 40 * 60 * 1000).toISOString(), isCurrent: false },
  { id: 'osess-03', user: 'kaan.yildiz', device: 'Edge · Windows 10', ipAddress: '95.10.88.2', location: 'Izmir, TR', lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isCurrent: false },
  { id: 'osess-04', user: 'aylin.polat', device: 'Safari · iPhone', ipAddress: '78.183.22.7', location: 'Bursa, TR', lastActive: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), isCurrent: false },
];

export interface AccessReviewEntry {
  id: string;
  user: string;
  role: string;
  requestedAt: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const ACCESS_REVIEWS: AccessReviewEntry[] = [
  { id: 'rev-01', user: 'kaan.yildiz', role: 'Editor', requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Role coverage exceeds 80% of permissions', status: 'pending' },
  { id: 'rev-02', user: 'aylin.polat', role: 'Viewer', requestedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Inactive for 30+ days with elevated access', status: 'pending' },
  { id: 'rev-03', user: 'gizem.arslan', role: 'Editor', requestedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), reason: 'Quarterly access recertification', status: 'approved' },
];
