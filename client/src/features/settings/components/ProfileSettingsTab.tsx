import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userService } from '@/features/users/services/userService';
import { updateUserInfo } from '@/features/auth/store/authSlice';
import { realtimeEventBus } from '@/core/realtime/realtimeEventBus';
import type { RootState } from '@/core/store/store';

const ProfileSettingsTab = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [bio, setBio] = useState(currentUser?.bio ?? '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profileImageUrl ?? null);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => userService.updateUserByAdmin(currentUser!.id, data),
    onSuccess: (response) => {
      if (response.success) {
        dispatch(updateUserInfo({ username, profileImageUrl: previewUrl ?? undefined }));
        toast.success('Profil bilgileriniz güncellendi.');
        realtimeEventBus.publish({
          type: 'SETTINGS_UPDATED',
          title: 'Profil güncellendi',
          description: `@${username} profil bilgilerini güncelledi`,
          actor: username,
          status: 'success',
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('Username', username);
    data.append('Email', email);
    data.append('Bio', bio);
    if (selectedFile) {
      data.append('ImageFile', selectedFile);
    }
    updateMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={previewUrl || 'https://ui-avatars.com/api/?name=' + username}
            className="w-16 h-16 rounded-full object-cover border border-outline-variant dark:border-dark-outline-variant"
            alt="Profil"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <span className="material-symbols-outlined text-white text-[18px]">photo_camera</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Profil Fotoğrafı</p>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">Değiştirmek için üzerine gelin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
            Kullanıcı Adı
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface rounded-lg px-4 py-2 text-sm outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
            E-posta
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface rounded-lg px-4 py-2 text-sm outline-none focus:border-outline dark:focus:border-dark-outline transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
          Biyografi
        </label>
        <textarea
          value={bio ?? ''}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full bg-surface dark:bg-dark-surface border border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface rounded-lg px-4 py-2 text-sm outline-none focus:border-outline dark:focus:border-dark-outline transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={updateMutation.isPending}
        className="px-5 py-2.5 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {updateMutation.isPending ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
      </button>
    </form>
  );
};

export default ProfileSettingsTab;
