import { useState } from 'react';
import UserTable from '../components/UserTable';
import InviteUserModal from '../components/InviteUserModal';

const UserManagementPage = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-7xl mx-auto w-full">
      {/* Sayfa Başlığı Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-background tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
            User Management
          </h2>
          <p className="text-on-surface-variant text-sm">Manage team access, roles, and administrative privileges.</p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
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
