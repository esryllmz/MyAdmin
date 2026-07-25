import { useMemo } from 'react';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';

const ReportsPermissionsPage = () => {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [] } = usePermissions();

  const overPrivileged = useMemo(
    () =>
      roles
        .map((role) => ({ role, grantCount: role.permissions.length }))
        .filter((entry) => permissions.length > 0 && entry.grantCount / permissions.length >= 0.8),
    [roles, permissions]
  );

  return (
    <div>
      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden mb-6">
        <div className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">
          <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Role-Based Permission Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low/60 dark:bg-dark-surface-container-low/60 text-on-surface-variant dark:text-dark-on-surface-variant font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Granted Permissions</th>
                <th className="px-5 py-3">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
              {rolesLoading ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-on-surface-variant dark:text-dark-on-surface-variant">
                    Yükleniyor...
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const coverage = permissions.length > 0 ? Math.round((role.permissions.length / permissions.length) * 100) : 0;
                  return (
                    <tr key={role.id}>
                      <td className="px-5 py-3 font-medium text-on-surface dark:text-dark-on-surface">{role.label || role.name}</td>
                      <td className="px-5 py-3 text-on-surface-variant dark:text-dark-on-surface-variant">
                        {role.permissions.length} / {permissions.length}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-outline-variant/60 dark:bg-dark-outline-variant overflow-hidden">
                            <div
                              className="h-full bg-on-surface dark:bg-dark-on-surface"
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{coverage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
        <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-1">Over-Privileged Roles</h3>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-4">
          Roles holding 80% or more of all defined permissions.
        </p>
        {overPrivileged.length === 0 ? (
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Aşırı yetkilendirilmiş rol bulunamadı.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {overPrivileged.map(({ role, grantCount }) => (
              <span
                key={role.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-warning/10 text-warning px-2.5 py-1 text-xs font-semibold"
              >
                {role.name} · {grantCount} yetki
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPermissionsPage;
