import { Link } from 'react-router-dom';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { ORG_SESSIONS, ACCESS_REVIEWS } from '../data/securityMock';

const SecurityOverviewPage = () => {
  const { data: users = [] } = useUsers();
  const { data: activities = [] } = useActivities();

  const failedCount = activities.filter((activity) => !activity.isSuccess).length;
  const pendingReviews = ACCESS_REVIEWS.filter((review) => review.status === 'pending').length;

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Security Overview</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Organization-wide security posture at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">Active Sessions</p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">{ORG_SESSIONS.length}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">Pending Reviews</p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">{pendingReviews}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">Failed Attempts</p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">{failedCount}</p>
        </div>
        <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant dark:text-dark-on-surface-variant">MFA Adoption</p>
          <p className="text-3xl font-bold text-on-surface dark:text-dark-on-surface mt-2">0%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/security/sessions"
          className="rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6 hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
        >
          <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Active Sessions</h3>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1.5">
            {ORG_SESSIONS.length} devices across {users.length} kullanıcı. Şüpheli oturumları inceleyin ve iptal edin.
          </p>
        </Link>
        <Link
          to="/security/access-reviews"
          className="rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest p-6 hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
        >
          <h3 className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">Access Reviews</h3>
          <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-1.5">
            {pendingReviews} bekleyen inceleme. Aşırı yetkilendirilmiş veya inaktif hesapları gözden geçirin.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default SecurityOverviewPage;
