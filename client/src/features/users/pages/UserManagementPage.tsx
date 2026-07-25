import { useState } from 'react';
import UserTable from '../components/UserTable';
import InviteUserModal from '../components/InviteUserModal';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

const UserManagementPage = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { can } = useRolePermissions();
  const invitePermission = can('inviteUser');

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-7xl mx-auto w-full">
      {/* Sayfa Başlığı Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
            User Management
          </h2>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-sm">Manage team access, roles, and administrative privileges.</p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          disabled={!invitePermission.allowed}
          title={invitePermission.reason}
          className="bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite User
        </button>
      </div>

      {/* Kullanıcı Veri Tablosu */}
      <UserTable />

      <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </div>
  );
};

export default UserManagementPage;
