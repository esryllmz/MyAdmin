import { useMyActivities } from '@/features/activities/hooks/useActivities';
import { formatRelativeTime } from '@/core/utils/formatRelativeTime';

const AuditLogTab = () => {
  const { data: activities = [], isLoading, isError } = useMyActivities();

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mb-4">
        A record of the changes made with this account.
      </p>

      <div className="rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">Loading...</p>
        ) : isError ? (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            Something went wrong loading your activity.
          </p>
        ) : activities.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            No recorded activity for this account yet.
          </p>
        ) : (
          activities.slice(0, 30).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-on-surface dark:text-dark-on-surface">{activity.action}</span>
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
