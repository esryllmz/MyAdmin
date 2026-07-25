import { useState } from 'react';
import { toast } from 'react-toastify';
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useIsAdmin } from '@/core/hooks/useIsAdmin';

const generateFakeKey = () => `sk_demo_${crypto.randomUUID().replace(/-/g, '')}`;
const maskKey = (key: string) => `${key.slice(0, 11)}${'•'.repeat(24)}`;

const ApiKeysTab = () => {
  const isAdmin = useIsAdmin();
  const [apiKey, setApiKey] = useState(generateFakeKey);
  const [isRevealed, setIsRevealed] = useState(false);

  const guardAdminAction = () => {
    if (!isAdmin) {
      toast.error('Bu işlem için Admin yetkisi gereklidir.');
      return false;
    }
    return true;
  };

  const handleToggleReveal = () => {
    if (!guardAdminAction()) return;
    setIsRevealed((prev) => !prev);
  };

  const handleRegenerate = () => {
    if (!guardAdminAction()) return;
    setApiKey(generateFakeKey());
    setIsRevealed(true);
    toast.success('Yeni API anahtarı oluşturuldu.');
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
        <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1.5">
          Kişisel Erişim Anahtarı
        </label>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-surface-container-low border border-outline-variant/20 px-4 py-2.5 rounded-lg font-mono text-xs text-on-surface truncate">
            {isRevealed ? apiKey : maskKey(apiKey)}
          </code>
          <button
            type="button"
            onClick={handleToggleReveal}
            title={isAdmin ? (isRevealed ? 'Gizle' : 'Göster') : 'Admin yetkisi gerekir'}
            className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            title="Kopyala"
            className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRegenerate}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant/20 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Yeniden Oluştur
      </button>
    </div>
  );
};

export default ApiKeysTab;
