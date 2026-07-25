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
    <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-on-surface">Active Roles</h3>
        <button
          onClick={onNewRole}
          disabled={!newRolePermission.allowed}
          title={newRolePermission.reason}
          className="text-sm font-medium text-primary hover:text-primary-container transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-primary"
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
                  ? 'bg-surface-container-highest border-transparent'
                  : 'bg-surface-container-low border-outline-variant/10 hover:bg-surface-container'
                }`}
            >
              <div>
                <div className="font-semibold text-on-surface flex items-center gap-2">
                  {role.label || role.name}
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {role.name}
                  </span>
                </div>
                <div className="text-xs text-on-surface-variant mt-1">{role.description}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-on-surface">{countUsersForRole(role.id)} Users</div>
                <div className="text-xs text-on-surface-variant">{role.permissions.length} Permissions</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleList;
