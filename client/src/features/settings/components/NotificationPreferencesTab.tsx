import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { realtimeEventBus } from '@/core/realtime/realtimeEventBus';
import type { RootState } from '@/core/store/store';

interface Preferences {
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
}

const PREFERENCE_ITEMS: Array<{ key: keyof Preferences; label: string; desc: string }> = [
  { key: 'email', label: 'E-posta Bildirimleri', desc: 'Kritik sistem olayları için e-posta al.' },
  { key: 'push', label: 'Anlık Bildirimler', desc: 'Tarayıcı üzerinden anlık bildirim al.' },
  { key: 'weeklyDigest', label: 'Haftalık Özet', desc: 'Haftalık aktivite özetini e-posta ile al.' },
];

const NotificationPreferencesTab = () => {
  const actor = useSelector((state: RootState) => state.auth.user?.username) ?? 'Bilinmeyen Kullanıcı';
  const [preferences, setPreferences] = useState<Preferences>({
    email: true,
    push: true,
    weeklyDigest: false,
  });

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success('Bildirim tercihleriniz kaydedildi.');
    realtimeEventBus.publish({
      type: 'SETTINGS_UPDATED',
      title: 'Bildirim tercihleri güncellendi',
      description: `${actor} bildirim tercihlerini güncelledi`,
      actor,
      status: 'success',
    });
  };

  return (
    <div className="max-w-xl space-y-5">
      <p className="text-xs text-on-surface-variant italic">
        Bu tercihler şu an yalnızca bu oturumda saklanır — backend'de henüz bir bildirim tercihi entegrasyonu bulunmuyor.
      </p>

      <div className="space-y-3">
        {PREFERENCE_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low/50 border border-outline-variant/10 cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-on-surface">{item.label}</p>
              <p className="text-xs text-on-surface-variant">{item.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={preferences[item.key]}
              onChange={() => togglePreference(item.key)}
              className="rounded border-outline-variant/40 text-primary focus:ring-primary w-5 h-5"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#004ac6] to-[#2563eb] text-white text-sm font-bold hover:brightness-110 transition-all"
      >
        Kaydet
      </button>
    </div>
  );
};

export default NotificationPreferencesTab;
