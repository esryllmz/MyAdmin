import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { realtimeEventBus } from '@/core/realtime/realtimeEventBus';
import type { RootState } from '@/core/store/store';

interface Preferences {
  security: boolean;
  roleUpdates: boolean;
  invitations: boolean;
  accessRequests: boolean;
  apiKeyEvents: boolean;
  reportCompletion: boolean;
  systemIncidents: boolean;
  productUpdates: boolean;
  email: boolean;
  inApp: boolean;
}

const PREFERENCE_ITEMS: Array<{ key: keyof Preferences; label: string; desc: string }> = [
  { key: 'security', label: 'Security Alerts', desc: 'Başarısız girişler ve kritik güvenlik olayları.' },
  { key: 'roleUpdates', label: 'Role Updates', desc: 'Rol ve yetki değişiklikleri.' },
  { key: 'invitations', label: 'User Invitations', desc: 'Yeni kullanıcı davetleri.' },
  { key: 'accessRequests', label: 'Access Requests', desc: 'Erişim/yetki talepleri.' },
  { key: 'apiKeyEvents', label: 'API Key Events', desc: 'Anahtar oluşturma, yenileme ve iptal işlemleri.' },
  { key: 'reportCompletion', label: 'Report Completion', desc: 'Zamanlanmış raporlar tamamlandığında bildir.' },
  { key: 'systemIncidents', label: 'System Incidents', desc: 'Sistem kesintisi veya bozulma durumları.' },
  { key: 'productUpdates', label: 'Product Updates', desc: 'Yeni özellik ve sürüm duyuruları.' },
  { key: 'email', label: 'Email Notifications', desc: 'Yukarıdaki olaylar için e-posta gönder.' },
  { key: 'inApp', label: 'In-App Notifications', desc: 'Yukarıdaki olaylar için bildirim merkezinde göster.' },
];

const NotificationPreferencesTab = () => {
  const actor = useSelector((state: RootState) => state.auth.user?.username) ?? 'Bilinmeyen Kullanıcı';
  const [preferences, setPreferences] = useState<Preferences>({
    security: true,
    roleUpdates: true,
    invitations: true,
    accessRequests: true,
    apiKeyEvents: false,
    reportCompletion: true,
    systemIncidents: true,
    productUpdates: false,
    email: true,
    inApp: true,
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
      <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant italic">
        Bu tercihler şu an yalnızca bu oturumda saklanır — backend'de henüz bir bildirim tercihi entegrasyonu bulunmuyor.
      </p>

      <div className="space-y-2.5">
        {PREFERENCE_ITEMS.map((item) => (
          <label
            key={item.key}
            className="flex items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-low/50 dark:bg-dark-surface-container-low/50 border border-outline-variant/60 dark:border-dark-outline-variant cursor-pointer"
          >
            <div>
              <p className="text-sm font-medium text-on-surface dark:text-dark-on-surface">{item.label}</p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{item.desc}</p>
            </div>
            <input
              type="checkbox"
              checked={preferences[item.key]}
              onChange={() => togglePreference(item.key)}
              className="rounded border-outline-variant/60 dark:border-dark-outline-variant text-on-surface dark:text-dark-on-surface focus:ring-0 w-5 h-5"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Kaydet
      </button>
    </div>
  );
};

export default NotificationPreferencesTab;
