import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { RegisterUserRequest } from '@/features/auth/types/authTypes';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteUserModal = ({ isOpen, onClose }: InviteUserModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RegisterUserRequest>({
    username: '',
    email: '',
    password: ''
  });

  const inviteMutation = useMutation({
    mutationFn: (data: RegisterUserRequest) => userService.inviteUser(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] }); // Tabloyu tazele
        onClose(); // Modalı kapat
        setFormData({ username: '', email: '', password: '' }); // Formu temizle
      }
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h3 className="text-xl font-bold text-on-surface">Yeni Kullanıcı Davet Et</h3>
            <p className="text-xs text-on-surface-variant">Sisteme yeni bir ekip üyesi ekleyin.</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(formData); }}>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">Kullanıcı Adı</label>
            <input
              required
              type="text"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="myadmin"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">E-posta Adresi</label>
            <input
              required
              type="email"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="ornek@mail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-1.5">Geçici Şifre</label>
            <input
              required
              type="password"
              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#FF3737] to-[#FF4646] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              İptal
            </button>

            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {inviteMutation.isPending ? 'Gönderiliyor...' : 'Davet Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteUserModal;