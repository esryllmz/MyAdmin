import  { useState} from 'react'; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { UserResponseDto } from '../types/userTypes';

interface EditUserModalProps {
  user: UserResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditUserModal = ({ user, isOpen, onClose }: EditUserModalProps) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profileImageUrl || null);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => userService.updateUserByAdmin(user!.id, data),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        onClose();
      }
    }
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Username', formData.username);
    data.append('Email', formData.email);
    data.append('Bio', formData.bio);
    if (selectedFile) {
      data.append('ImageFile', selectedFile);
    }
    updateMutation.mutate(data);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="text-xl font-bold text-on-surface">Kullanıcıyı Yönet</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form className="p-6 space-y-5" onSubmit={handleSubmit}>
          {/* Profil Fotoğrafı */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="relative group">
              <img
                src={previewUrl || "https://ui-avatars.com/api/?name=" + formData.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/10 shadow-md"
                alt="Preview"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="material-symbols-outlined text-white">photo_camera</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Form Alanları */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">Kullanıcı Adı</label>
              <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">E-posta</label>
              <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">Biyografi</label>
            <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} className="w-full bg-surface border border-outline-variant/20 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all resize-none" />
          </div>

          {/* BUTONLAR (RENKLER SABİTLENDİ) */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#FF3737] to-[#FF4646] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;