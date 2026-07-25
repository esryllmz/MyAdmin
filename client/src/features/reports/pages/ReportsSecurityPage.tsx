import { useMemo } from 'react';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const CRITICAL_KEYWORDS = ['ROLE', 'PERMISSION', 'DELETE', 'SYNC'];

const ReportsSecurityPage = () => {
  const { data: activities = [], isLoading } = useActivities();

  const failedEvents = useMemo(() => activities.filter((activity) => !activity.isSuccess), [activities]);
  const criticalEvents = useMemo(
    () => activities.filter((activity) => CRITICAL_KEYWORDS.some((keyword) => activity.action.toUpperCase().includes(keyword))),
    [activities]
  );

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
            Failed Attempts
          </p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">{failedEvents.length}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
            Critical Events
          </p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">{criticalEvents.length}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">
            Active Threats
          </p>
          <p className="text-3xl font-bold text-success mt-2">0</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden">
        <div className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">
          <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Failed Logins & Suspicious Activity</h3>
        </div>
        <div className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {isLoading ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Yükleniyor...</p>
          ) : failedEvents.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              Başarısız giriş veya şüpheli aktivite yok.
            </p>
          ) : (
            failedEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="text-on-surface dark:text-dark-on-surface font-medium">
                    {event.userName ?? 'Bilinmeyen kullanıcı'} · {event.action}
                  </p>
                  <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">{event.entityName}</p>
                </div>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatRelativeTime(event.createdDate)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant overflow-hidden mt-6">
        <div className="px-5 py-3.5 border-b border-outline-variant/60 dark:border-dark-outline-variant">
          <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Role & Permission Changes</h3>
        </div>
        <div className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {criticalEvents.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              Kritik yetki değişikliği kaydı yok.
            </p>
          ) : (
            criticalEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-on-surface dark:text-dark-on-surface">
                  {event.userName ?? 'Sistem'} · {event.action} · {event.entityName}
                </span>
                <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {formatRelativeTime(event.createdDate)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsSecurityPage;
