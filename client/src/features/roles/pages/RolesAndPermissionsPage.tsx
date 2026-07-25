import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoleList from '../components/RoleList';
import PermissionPanel from '../components/PermissionPanel';
import NewRoleModal from '../components/NewRoleModal';
import { useRoles } from '../hooks/useRoles';

const RolesAndPermissionsPage = () => {
  const { id: routeRoleId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { data: roles } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(routeRoleId ?? null);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);

  // Roller ilk yüklendiğinde ve route'ta bir id yoksa varsayılan olarak ilk rolü seç.
  if (!selectedRoleId && roles && roles.length > 0) {
    setSelectedRoleId(roles[0].id);
  }

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    navigate(`/roles/${roleId}`, { replace: true });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight mb-2">
            Roles
          </h2>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-sm">
            Manage user roles and their permission scope across the organization.
          </p>
        </div>
        <a
          href="/permissions"
          className="text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:underline"
        >
          View Permission Catalog →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RoleList
          selectedRoleId={selectedRoleId}
          onSelectRole={handleSelectRole}
          onNewRole={() => setIsNewRoleModalOpen(true)}
        />
        <PermissionPanel selectedRoleId={selectedRoleId} />
      </div>

      <NewRoleModal isOpen={isNewRoleModalOpen} onClose={() => setIsNewRoleModalOpen(false)} />
    </div>
  );
};

export default RolesAndPermissionsPage;
