import { useState } from 'react';
import ProfileSettingsTab from '../components/ProfileSettingsTab';
import ThemeSettingsTab from '../components/ThemeSettingsTab';
import NotificationPreferencesTab from '../components/NotificationPreferencesTab';
import ApiKeysTab from '../components/ApiKeysTab';

type TabKey = 'profile' | 'theme' | 'notifications' | 'apiKeys';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'profile', label: 'Profil Bilgileri' },
  { key: 'theme', label: 'Tema' },
  { key: 'notifications', label: 'Bildirim Tercihleri' },
  { key: 'apiKeys', label: 'API Anahtarları' },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
          Settings
        </h2>
        <p className="text-on-surface-variant text-sm">Sistem ve profil ayarlarınızı buradan yönetin.</p>
      </div>

      <div className="flex gap-6 border-b border-outline-variant/20 mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 border-b-2 text-sm px-1 whitespace-nowrap transition-colors ${activeTab === tab.key
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-on-surface-variant font-medium hover:text-on-surface'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/10">
        {activeTab === 'profile' && <ProfileSettingsTab />}
        {activeTab === 'theme' && <ThemeSettingsTab />}
        {activeTab === 'notifications' && <NotificationPreferencesTab />}
        {activeTab === 'apiKeys' && <ApiKeysTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
