import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { realtimeEventBus } from '@/core/realtime/realtimeEventBus';
import type { RootState } from '@/core/store/store';

const generateFakeKey = () => `sk_demo_${crypto.randomUUID().replace(/-/g, '')}`;
const maskKey = (key: string) => `${key.slice(0, 11)}${'•'.repeat(24)}`;

const ApiKeysTab = () => {
  const { can } = useRolePermissions();
  const apiKeyPermission = can('manageApiKeys');
  const actor = useSelector((state: RootState) => state.auth.user?.username) ?? 'Bilinmeyen Kullanıcı';
  const [apiKey, setApiKey] = useState(generateFakeKey);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isRevoked, setIsRevoked] = useState(false);
  const [createdAt] = useState(() => new Date());
  const [lastUsedAt] = useState(() => new Date(Date.now() - 3 * 60 * 60 * 1000));

  const handleToggleReveal = () => {
    if (!apiKeyPermission.allowed) return;
    setIsRevealed((prev) => !prev);
  };

  const handleRegenerate = () => {
    if (!apiKeyPermission.allowed) return;
    setApiKey(generateFakeKey());
    setIsRevealed(true);
    setIsRevoked(false);
    toast.success('Yeni API anahtarı oluşturuldu.');
    realtimeEventBus.publish({
      type: 'SETTINGS_UPDATED',
      title: 'API anahtarı yenilendi',
      description: 'Kişisel erişim anahtarını yeniden oluşturdu',
      actor,
      status: 'success',
    });
  };

  const handleRevoke = () => {
    if (!apiKeyPermission.allowed || isRevoked) return;
    setIsRevoked(true);
    setIsRevealed(false);
    toast.success('API anahtarı iptal edildi.');
    realtimeEventBus.publish({
      type: 'SETTINGS_UPDATED',
      title: 'API anahtarı iptal edildi',
      description: 'Kişisel erişim anahtarını iptal etti',
      actor,
      status: 'success',
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('Panoya kopyalandı.');
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3.5 text-xs text-warning flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
        <span>Demo Ortamı — bu anahtarlar simüledir, gerçek bir API entegrasyonu için kullanılamaz.</span>
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant mb-1.5">
          Kişisel Erişim Anahtarı
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-surface-container-low dark:bg-dark-surface-container-low border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2.5 rounded-lg font-mono text-xs text-on-surface dark:text-dark-on-surface truncate">
            {isRevoked ? 'İptal edildi' : isRevealed ? apiKey : maskKey(apiKey)}
          </code>
          <button
            type="button"
            onClick={handleToggleReveal}
            disabled={!apiKeyPermission.allowed || isRevoked}
            title={apiKeyPermission.allowed ? (isRevealed ? 'Gizle' : 'Göster') : apiKeyPermission.reason}
            className="p-2.5 rounded-lg text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={isRevoked}
            title="Kopyala"
            className="p-2.5 rounded-lg text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Created</p>
          <p className="text-on-surface dark:text-dark-on-surface font-medium mt-0.5">{createdAt.toLocaleDateString('tr-TR')}</p>
        </div>
        <div>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Last Used</p>
          <p className="text-on-surface dark:text-dark-on-surface font-medium mt-0.5">{lastUsedAt.toLocaleString('tr-TR')}</p>
        </div>
        <div>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Expiration</p>
          <p className="text-on-surface dark:text-dark-on-surface font-medium mt-0.5">Does not expire</p>
        </div>
        <div>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant">Status</p>
          <p className={`font-medium mt-0.5 ${isRevoked ? 'text-error' : 'text-success'}`}>
            {isRevoked ? 'Revoked' : 'Active'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={!apiKeyPermission.allowed}
          title={apiKeyPermission.reason}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant text-sm font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regenerate
        </button>
        <button
          type="button"
          onClick={handleRevoke}
          disabled={!apiKeyPermission.allowed || isRevoked}
          title={apiKeyPermission.reason}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-error hover:bg-error/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Revoke
        </button>
      </div>
    </div>
  );
};

export default ApiKeysTab;
