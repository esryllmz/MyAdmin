import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { realtimeEventBus } from '@/core/realtime/realtimeEventBus';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import type { RootState } from '@/core/store/store';

interface Preferences {
  accountSecurity: boolean;
  loginAlerts: boolean;
  passwordChanges: boolean;
  sessionChanges: boolean;
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

const DEFAULT_PREFERENCES: Preferences = {
  accountSecurity: true,
  loginAlerts: true,
  passwordChanges: true,
  sessionChanges: true,
  roleUpdates: true,
  invitations: true,
  accessRequests: true,
  apiKeyEvents: false,
  reportCompletion: true,
  systemIncidents: true,
  productUpdates: false,
  email: true,
  inApp: true,
};

const STORAGE_KEY = 'notificationPreferences';

const readStoredPreferences = (): Preferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

// Personal categories every role sees, plus the admin/system-facing categories shown only to
// Editor/Admin — Viewer never sees role, invitation, access-request, or API key events, since
// those describe changes Viewer has no visibility or stake in.
const PERSONAL_ITEMS: Array<{ key: keyof Preferences; label: string; desc: string }> = [
  { key: 'accountSecurity', label: 'Account Security', desc: 'Changes that affect your account security.' },
  { key: 'loginAlerts', label: 'Login Alerts', desc: 'A new sign-in to your account from this or another device.' },
  { key: 'passwordChanges', label: 'Password Changes', desc: 'Your password was changed.' },
  { key: 'sessionChanges', label: 'Session Changes', desc: 'A session was signed out or revoked.' },
  { key: 'reportCompletion', label: 'Report Completion', desc: 'Notify when a report you requested is ready.' },
  { key: 'productUpdates', label: 'Product Updates', desc: 'New features and release announcements.' },
];

const MANAGEMENT_ITEMS: Array<{ key: keyof Preferences; label: string; desc: string }> = [
  { key: 'roleUpdates', label: 'Role Updates', desc: 'Role and permission changes.' },
  { key: 'invitations', label: 'User Invitations', desc: 'New user invitations.' },
  { key: 'accessRequests', label: 'Access Requests', desc: 'Access or permission requests.' },
  { key: 'apiKeyEvents', label: 'API Key Events', desc: 'Key creation, renewal, and revocation.' },
  { key: 'systemIncidents', label: 'System Incidents', desc: 'Outages or degraded system conditions.' },
];

const DELIVERY_ITEMS: Array<{ key: keyof Preferences; label: string; desc: string }> = [
  { key: 'email', label: 'Email Notifications', desc: 'Send an email for the events above.' },
  { key: 'inApp', label: 'In-App Notifications', desc: 'Show the events above in the notification center.' },
];

const NotificationPreferencesTab = () => {
  const actor = useSelector((state: RootState) => state.auth.user?.username) ?? 'Unknown user';
  const { isViewer } = useRolePermissions();
  const [preferences, setPreferences] = useState<Preferences>(readStoredPreferences);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = (key: keyof Preferences) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      realtimeEventBus.publish({
        type: 'SETTINGS_UPDATED',
        title: 'Notification preferences updated',
        description: `${actor} updated their notification preferences`,
        actor,
        status: 'success',
      });
      return next;
    });
  };

  const renderGroup = (items: typeof PERSONAL_ITEMS, heading?: string) => (
    <div className="space-y-2.5">
      {heading && (
        <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant dark:text-dark-on-surface-variant">
          {heading}
        </p>
      )}
      {items.map((item) => (
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
  );

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-xs italic text-on-surface-variant dark:text-dark-on-surface-variant">
        Preferences apply immediately and are stored on this device.
      </p>

      {renderGroup(PERSONAL_ITEMS)}
      {!isViewer && renderGroup(MANAGEMENT_ITEMS, 'Management')}
      {renderGroup(DELIVERY_ITEMS, 'Delivery')}
    </div>
  );
};

export default NotificationPreferencesTab;
