import { useState } from 'react';
import { toast } from 'react-toastify';
import { ORG_SESSIONS } from '../data/securityMock';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

const SecuritySessionsPage = () => {
  const { isAdmin } = useRolePermissions();
  const [revoked, setRevoked] = useState<string[]>([]);

  const handleRevoke = (id: string, isCurrent: boolean) => {
    if (isCurrent) return;
    if (!isAdmin) {
      toast.error('Bu işlem için Admin yetkisi gereklidir.');
      return;
    }
    setRevoked((prev) => [...prev, id]);
    toast.success('Oturum sonlandırıldı.');
  };

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Active Sessions</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Tüm kullanıcıların aktif oturumları ve cihazları.
        </p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Device</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Last Active</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {ORG_SESSIONS.map((session) => {
                const isRevoked = revoked.includes(session.id);
                return (
                  <tr key={session.id} className={isRevoked ? 'opacity-40' : ''}>
                    <td className="px-5 py-3 font-medium text-on-surface dark:text-dark-on-surface">@{session.user}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{session.device}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant font-mono text-xs">{session.ipAddress}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">{session.location}</td>
                    <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                      {formatRelativeTime(session.lastActive)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {session.isCurrent ? (
                        <span className="text-[10px] font-bold uppercase tracking-wide bg-success/10 text-success px-2 py-1 rounded">
                          Current
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRevoke(session.id, session.isCurrent)}
                          disabled={isRevoked || !isAdmin}
                          title={isAdmin ? undefined : 'Bu işlem için Admin yetkisi gereklidir.'}
                          className="text-xs font-semibold text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          {isRevoked ? 'Revoked' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SecuritySessionsPage;
