import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { usePermissions } from '@/features/permissions/hooks/usePermissions';
import { groupPermissionsByResource } from '@/features/permissions/utils/groupPermissions';
import { useCreateRole, useSyncRolePermissions } from '../hooks/useRoles';

interface NewRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewRoleModal = ({ isOpen, onClose }: NewRoleModalProps) => {
  const { data: permissions = [] } = usePermissions();
  const permissionGroups = groupPermissionsByResource(permissions);

  const createRole = useCreateRole();
  const syncPermissions = useSyncRolePermissions();

  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setLabel('');
    setDescription('');
    setSelectedIds([]);
  };

  const togglePermission = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRole.mutate(
      { name, label: label || null, description: description || null },
      {
        onSuccess: (response) => {
          const newRoleId = response.data?.id;
          if (newRoleId && selectedIds.length > 0) {
            const selectedPermissions = permissions.filter((permission) => selectedIds.includes(permission.id));
            syncPermissions.mutate({ roleId: newRoleId, permissions: selectedPermissions });
          }
          resetForm();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Rol Oluştur</DialogTitle>
          <DialogDescription>Rol bilgilerini girin ve isteğe bağlı olarak başlangıç yetkilerini seçin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
              Rol Adı
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="örn. Support"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
              Etiket
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="örn. Destek Ekibi"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Bu rolün ne için kullanılacağını açıklayın."
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
              Yetki Seçimi
            </label>
            <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
              {permissionGroups.map((group) => (
                <div key={group.key}>
                  <p className="text-xs font-semibold text-on-surface-variant mb-1.5">{group.label}</p>
                  <div className="space-y-1.5 pl-2">
                    {group.permissions.map((permission) => (
                      <label key={permission.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="rounded border-outline-variant/40 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-on-surface">{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createRole.isPending}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {createRole.isPending ? 'Oluşturuluyor...' : 'Rol Oluştur'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewRoleModal;
