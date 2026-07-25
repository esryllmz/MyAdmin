import { Skeleton } from '@/core/components/ui/skeleton';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { groupPermissionsByResource } from '@/features/permissions/utils/groupPermissions';
import { useRoles } from '../hooks/useRoles';

const PermissionCatalog = () => {
  const { data: permissions = [], isLoading } = usePermissions();
  const { data: roles = [] } = useRoles();

  const permissionGroups = groupPermissionsByResource(permissions);

  const rolesForPermission = (permissionId: string) =>
    roles.filter((role) => role.permissions.some((permission) => permission.id === permissionId));

  return (
    <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">İzin Sözlüğü</h3>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Sistemdeki tüm izinler ve bu izinlere sahip roller.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {permissionGroups.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">folder</span> {group.label}
              </h4>
              <div className="space-y-2.5">
                {group.permissions.map((permission) => {
                  const grantedRoles = rolesForPermission(permission.id);
                  return (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{permission.name}</p>
                        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant truncate">
                          {permission.description || 'Açıklama yok.'}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
                        {grantedRoles.length > 0 ? (
                          grantedRoles.map((role) => (
                            <span
                              key={role.id}
                              className="text-[9px] font-bold uppercase tracking-widest bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface px-2 py-1 rounded-md"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-on-surface-variant/40 dark:text-dark-on-surface-variant/40 italic">Hiçbir role atanmamış</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionCatalog;
