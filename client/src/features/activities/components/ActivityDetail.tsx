import { useState } from 'react';
import { Database, Eye, EyeOff, Radio, Timer } from 'lucide-react';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';
import { deriveObservabilityMeta } from '@/core/utils/observability';
import type { ActivityResponseDto } from '../types/activityTypes';

interface ActivityDetailProps {
  activity: ActivityResponseDto | null;
}

const MASK_PLACEHOLDER = '••••••••••••••••••••';

const tryFormatJson = (value: string | null): string | null => {
  if (!value) return null;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

export const ActivityDetail = ({ activity }: ActivityDetailProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const { can } = useRolePermissions();
  const viewSensitivePermission = can('viewSensitiveData');

  if (!activity) {
    return (
      <div className="w-96 bg-surface-bright flex flex-col items-center justify-center hidden lg:flex border-l border-outline-variant/10 p-6 text-center gap-2">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">description</span>
        <p className="text-sm text-on-surface-variant">Detayları görmek için bir log satırı seçin.</p>
      </div>
    );
  }

  const oldValues = tryFormatJson(activity.oldValues);
  const newValues = tryFormatJson(activity.newValues);
  const observability = deriveObservabilityMeta(activity.id);

  const handleToggleReveal = () => {
    if (!viewSensitivePermission.allowed) return;
    setIsRevealed((prev) => !prev);
  };

  return (
    <div className="w-96 bg-surface-bright flex flex-col hidden lg:flex border-l border-outline-variant/10">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-on-background">Log Detail</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">ID: {activity.id}</p>
        </div>
        <span className={`material-symbols-outlined ${activity.isSuccess ? 'text-success' : 'text-error'}`}>
          {activity.isSuccess ? 'check_circle' : 'cancel'}
        </span>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-5">
        <div className="flex flex-wrap gap-2">
          <span
            title={`Correlation ID: ${observability.correlationId}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-success"
          >
            <Database className="w-3 h-3" /> Elasticsearch Indexed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            <Timer className="w-3 h-3" /> Response Time: {observability.responseTimeMs}ms
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-info">
            <Radio className="w-3 h-3" /> {observability.transport}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-mono font-semibold text-on-surface-variant">
            {observability.correlationId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-xs">
          <div>
            <span className="text-on-surface-variant">Actor</span>
            <p className="font-semibold text-on-surface mt-0.5">{activity.userName ?? 'Sistem'}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">Zaman</span>
            <p className="font-semibold text-on-surface mt-0.5">{new Date(activity.createdDate).toLocaleString('tr-TR')}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">Entity</span>
            <p className="font-semibold text-on-surface mt-0.5">{activity.entityName}</p>
          </div>
          <div>
            <span className="text-on-surface-variant">Aksiyon</span>
            <p className="font-semibold text-on-surface mt-0.5">{activity.action}</p>
          </div>
          {activity.ipAddress && (
            <div>
              <span className="text-on-surface-variant">IP Adresi</span>
              <p className="font-semibold text-on-surface mt-0.5">{activity.ipAddress}</p>
            </div>
          )}
          <div>
            <span className="text-on-surface-variant">Durum</span>
            <p className={`font-semibold mt-0.5 ${activity.isSuccess ? 'text-success' : 'text-error'}`}>
              {activity.isSuccess ? 'Başarılı' : 'Başarısız'}
            </p>
          </div>
        </div>

        {(oldValues || newValues) && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                Değişiklik Detayı (Hassas Veri)
              </p>
              <button
                type="button"
                onClick={handleToggleReveal}
                disabled={!viewSensitivePermission.allowed}
                title={viewSensitivePermission.allowed ? (isRevealed ? 'Gizle' : 'Göster') : viewSensitivePermission.reason}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {isRevealed ? 'Gizle' : 'Göster'}
              </button>
            </div>

            <div className="space-y-3">
              {oldValues && (
                <div>
                  <p className="text-[10px] font-semibold text-on-surface-variant mb-1">Eski Değer</p>
                  <div className="bg-inverse-surface rounded-lg p-4 font-mono text-xs text-inverse-on-surface leading-relaxed overflow-x-auto">
                    <pre>{isRevealed ? oldValues : MASK_PLACEHOLDER}</pre>
                  </div>
                </div>
              )}

              {newValues && (
                <div>
                  <p className="text-[10px] font-semibold text-on-surface-variant mb-1">Yeni Değer</p>
                  <div className="bg-inverse-surface rounded-lg p-4 font-mono text-xs text-inverse-on-surface leading-relaxed overflow-x-auto">
                    <pre>{isRevealed ? newValues : MASK_PLACEHOLDER}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!oldValues && !newValues && (
          <p className="text-xs text-on-surface-variant italic">Bu kayıt için değişiklik verisi bulunmuyor.</p>
        )}
      </div>
    </div>
  );
};
