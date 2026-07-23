import type { ActivityResponseDto } from '../types/activityTypes';

interface ActivityDetailProps {
  activity: ActivityResponseDto | null;
}

const tryFormatJson = (value: string | null): string | null => {
  if (!value) return null;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

export const ActivityDetail = ({ activity }: ActivityDetailProps) => {
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

        {oldValues && (
          <div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5">Eski Değer</p>
            <div className="bg-inverse-surface rounded-lg p-4 font-mono text-xs text-inverse-on-surface leading-relaxed overflow-x-auto">
              <pre>{oldValues}</pre>
            </div>
          </div>
        )}

        {newValues && (
          <div>
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5">Yeni Değer</p>
            <div className="bg-inverse-surface rounded-lg p-4 font-mono text-xs text-inverse-on-surface leading-relaxed overflow-x-auto">
              <pre>{newValues}</pre>
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
