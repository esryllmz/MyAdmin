import { useState } from 'react';
import { toast } from 'react-toastify';
import { ACCESS_REVIEWS } from '../data/securityMock';
import { useRolePermissions } from '@/core/hooks/useRolePermissions';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-error/10 text-error',
};

const SecurityAccessReviewsPage = () => {
  const { isAdmin } = useRolePermissions();
  const [reviews, setReviews] = useState(ACCESS_REVIEWS);

  const decide = (id: string, status: 'approved' | 'rejected') => {
    if (!isAdmin) {
      toast.error('Bu işlem için Admin yetkisi gereklidir.');
      return;
    }
    setReviews((current) => current.map((review) => (review.id === id ? { ...review, status } : review)));
    toast.success(status === 'approved' ? 'Erişim onaylandı.' : 'Erişim reddedildi.');
  };

  return (
    <div className="p-6 md:p-8 lg:px-12 max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-on-surface dark:text-dark-on-surface tracking-tight">Access Reviews</h2>
        <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-1">
          Aşırı yetkilendirilmiş veya inaktif hesaplar için erişim inceleme kuyruğu.
        </p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-dark-surface-container-lowest rounded-xl border border-outline-variant/60 dark:border-dark-outline-variant divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">
                @{review.user} · {review.role}
              </p>
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">{review.reason}</p>
              <p className="text-[11px] text-on-surface-variant/70 dark:text-dark-on-surface-variant/70 mt-1">
                {new Date(review.requestedAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded ${STATUS_STYLES[review.status]}`}>
                {review.status}
              </span>
              {review.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => decide(review.id, 'approved')}
                    disabled={!isAdmin}
                    className="text-xs font-semibold text-on-surface dark:text-dark-on-surface border border-outline-variant dark:border-dark-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decide(review.id, 'rejected')}
                    disabled={!isAdmin}
                    className="text-xs font-semibold text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityAccessReviewsPage;
