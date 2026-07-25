import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';
import { ActivityDetail } from '../components/ActivityDetail';

const ActivityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activities = [], isLoading } = useActivities();
  const activity = activities.find((candidate) => candidate.id === id) ?? null;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-on-surface-variant dark:text-dark-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <button
        onClick={() => navigate('/activities')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Activity
      </button>

      {!activity ? (
        <p className="text-center py-24 text-on-surface-variant dark:text-dark-on-surface-variant">Kayıt bulunamadı.</p>
      ) : (
        <div className="border border-outline-variant/60 dark:border-dark-outline-variant rounded-xl overflow-hidden">
          <ActivityDetail activity={activity} fullPage />
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;
