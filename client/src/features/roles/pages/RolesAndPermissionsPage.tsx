import { useState } from 'react';
import RoleList from '../components/RoleList';
import PermissionPanel from '../components/PermissionPanel';
import NewRoleModal from '../components/NewRoleModal';
import { useRoles } from '../hooks/useRoles';

const RolesAndPermissionsPage = () => {
  const { data: roles } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);

  // Roller ilk yüklendiğinde varsayılan olarak ilk rolü seç — useEffect yerine
  // render sırasında ayarlama (bu koşul yalnızca henüz seçim yokken tetiklenir).
  if (!selectedRoleId && roles && roles.length > 0) {
    setSelectedRoleId(roles[0].id);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
          Roles and Permissions
        </h2>
        <p className="text-on-surface-variant text-sm">Manage user roles and granular permissions across the organization.</p>
      </div>

      <div className="flex gap-6 border-b border-outline-variant/20 mb-8">
        <button className="pb-3 border-b-2 border-primary text-primary font-semibold text-sm px-1">Roles</button>
        <button className="pb-3 border-b-2 border-transparent text-on-surface-variant font-medium text-sm px-1">Permissions</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RoleList
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          onNewRole={() => setIsNewRoleModalOpen(true)}
        />
        <PermissionPanel selectedRoleId={selectedRoleId} />
      </div>

      <NewRoleModal isOpen={isNewRoleModalOpen} onClose={() => setIsNewRoleModalOpen(false)} />
    </div>
  );
};

export default RolesAndPermissionsPage;
