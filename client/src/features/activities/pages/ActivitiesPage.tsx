import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ActivityFilter } from '../components/ActivityFilter';
import { ActivityTable } from '../components/ActivityTable';
import { ActivityDetail } from '../components/ActivityDetail';
import { useActivities } from '../hooks/useActivities';
import { exportToCsv } from '@/core/utils/exportUtils';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';

const ActivitiesPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const { data: activities = [], isLoading } = useActivities();
  const [entityFilter, setEntityFilter] = useSearchParamState('entity', 'all');
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');

  const entityOptions = useMemo(
    () => Array.from(new Set(activities.map((activity) => activity.entityName))).sort(),
    [activities]
  );

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesEntity = entityFilter === 'all' || activity.entityName === entityFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'success' && activity.isSuccess) ||
        (statusFilter === 'failed' && !activity.isSuccess);
      return matchesEntity && matchesStatus;
    });
  }, [activities, entityFilter, statusFilter]);

  const selectedActivity = filteredActivities.find((activity) => activity.id === selectedActivityId) ?? null;

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      if (!filteredActivities.length) {
        toast.warning('Dışa aktarılacak aktivite yok');
        return;
      }
      exportToCsv(filteredActivities, 'activities');
    } catch (error) {
      console.error('CSV export hatası:', error);
      toast.error('Dışa aktarma sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-container-low">
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2
                className="text-3xl font-bold text-on-background tracking-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                Activity Details
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                System activity logs and data mutations.
              </p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={isExporting || !filteredActivities.length}
              className="bg-surface-container-lowest text-on-surface border border-outline-variant/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">
                {isExporting ? 'hourglass_empty' : 'download'}
              </span>
              {isExporting ? 'İhraç ediliyor...' : 'Export CSV'}
            </button>
          </div>
          <ActivityFilter
            entity={entityFilter}
            status={statusFilter}
            entityOptions={entityOptions}
            onEntityChange={setEntityFilter}
            onStatusChange={setStatusFilter}
          />
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex border border-outline-variant/10 shadow-sm">
            <ActivityTable
              activities={filteredActivities}
              selectedId={selectedActivityId}
              onSelectRow={setSelectedActivityId}
              isLoading={isLoading}
            />
            <ActivityDetail activity={selectedActivity} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesPage;
