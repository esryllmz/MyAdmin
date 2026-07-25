import { Skeleton } from '@/core/components/ui/skeleton';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { groupPermissionsByResource } from '@/features/permissions/utils/groupPermissions';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useRoles, useSyncRolePermissions } from '../hooks/useRoles';

interface PermissionPanelProps {
  selectedRoleId: string | null;
}

const PermissionPanel = ({ selectedRoleId }: PermissionPanelProps) => {
  const { data: roles = [] } = useRoles();
  const { data: allPermissions = [], isLoading } = usePermissions();
  const syncPermissions = useSyncRolePermissions();
  const { can } = useRolePermissions();
  const syncPermission = can('syncRolePermissions');

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const permissionGroups = groupPermissionsByResource(allPermissions);

  const handleToggle = (permissionId: string) => {
    if (!selectedRole || !syncPermission.allowed) return;

    const hasPermission = selectedRole.permissions.some((permission) => permission.id === permissionId);
    const nextPermissions = hasPermission
      ? selectedRole.permissions.filter((permission) => permission.id !== permissionId)
      : [...selectedRole.permissions, ...allPermissions.filter((permission) => permission.id === permissionId)];

    syncPermissions.mutate({ roleId: selectedRole.id, permissions: nextPermissions });
  };

  if (!selectedRole) {
    return (
      <div className="lg:col-span-5 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant flex flex-col h-[600px] items-center justify-center text-center gap-2">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 dark:text-dark-on-surface-variant/20">shield_person</span>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">İzinleri görüntülemek için soldan bir rol seçin.</p>
      </div>
    );
  }

  const isSyncingSelectedRole = syncPermissions.isPending && syncPermissions.variables?.roleId === selectedRole.id;

  return (
    <div className="lg:col-span-5 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant flex flex-col h-[600px]">
      <div className="border-b border-outline-variant/60 dark:border-dark-outline-variant pb-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">{selectedRole.label || selectedRole.name}</h3>
          <span className="material-symbols-outlined text-on-surface dark:text-dark-on-surface text-[20px]">admin_panel_settings</span>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
          {syncPermission.allowed
            ? 'Bir yetkiye tıklayarak anında güncelleyin.'
            : 'Sadece görüntüleme — düzenlemek için Admin yetkisi gerekir.'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-lg" />)
        ) : (
          permissionGroups.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">folder</span> {group.label}
              </h4>
              <div className="space-y-4 pl-6">
                {group.permissions.map((permission) => {
                  const isChecked = selectedRole.permissions.some((p) => p.id === permission.id);
                  return (
                    <label
                      key={permission.id}
                      title={syncPermission.allowed ? undefined : syncPermission.reason}
                      className={`flex items-start gap-3 cursor-pointer group ${isSyncingSelectedRole ? 'opacity-50 pointer-events-none' : ''
                        } ${!syncPermission.allowed ? 'cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(permission.id)}
                        disabled={!syncPermission.allowed}
                        className="mt-0.5 rounded border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface focus:ring-0 disabled:opacity-50"
                      />
                      <div>
                        <div className="text-sm font-medium text-on-surface dark:text-dark-on-surface transition-colors">
                          {permission.name}
                        </div>
                        <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                          {permission.description || 'Bu kaynak için yetki.'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PermissionPanel;
