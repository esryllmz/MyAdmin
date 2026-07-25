import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';
import type { RootState } from '@/core/store/store';

const AuditLogTab = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: activities = [], isLoading } = useActivities();

  const ownActivity = useMemo(
    () => activities.filter((activity) => activity.userId === currentUser?.id),
    [activities, currentUser]
  );

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-4">
        Bu hesapla gerçekleştirilen değişikliklerin kaydı.
      </p>

      <div className="rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Yükleniyor...</p>
        ) : ownActivity.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            Bu hesap için kayıtlı bir işlem bulunamadı.
          </p>
        ) : (
          ownActivity.slice(0, 30).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-on-surface dark:text-dark-on-surface">
                {activity.action} · {activity.entityName}
              </span>
              <span className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                {formatRelativeTime(activity.createdDate)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLogTab;
