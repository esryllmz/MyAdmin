import { Skeleton } from '@/core/components/ui/skeleton';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { useRoles } from '../hooks/useRoles';

interface RoleListProps {
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onNewRole: () => void;
}

const RoleList = ({ selectedRoleId, onSelectRole, onNewRole }: RoleListProps) => {
  const { data: roles = [], isLoading } = useRoles();
  const { data: users = [] } = useUsers();
  const { can } = useRolePermissions();
  const newRolePermission = can('newRole');

  const countUsersForRole = (roleId: string) =>
    users.filter((user) => user.roles?.some((role) => role.id === roleId)).length;

  return (
    <div className="lg:col-span-7 bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/60 dark:border-dark-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-on-surface dark:text-dark-on-surface">Active Roles</h3>
        <button
          onClick={onNewRole}
          disabled={!newRolePermission.allowed}
          title={newRolePermission.reason}
          className="text-sm font-medium text-on-surface dark:text-dark-on-surface hover:opacity-80 transition-opacity flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> New Role
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[72px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center justify-between border ${selectedRoleId === role.id
                  ? 'bg-surface-container-highest dark:bg-dark-surface-container-highest border-transparent'
                  : 'bg-surface-container-low dark:bg-dark-surface-container-low border-outline-variant/60 dark:border-dark-outline-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                }`}
            >
              <div>
                <div className="font-semibold text-on-surface dark:text-dark-on-surface flex items-center gap-2">
                  {role.label || role.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-on-surface/10 dark:bg-dark-on-surface/10 text-on-surface dark:text-dark-on-surface">
                    {role.name}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1">{role.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{countUsersForRole(role.id)} Users</div>
                <div className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{role.permissions.length} Permissions</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleList;
