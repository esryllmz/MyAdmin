import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityFilter } from '../components/ActivityFilter';
import { ActivityTable } from '../components/ActivityTable';
import { ActivityDetail } from '../components/ActivityDetail';
import { useActivities } from '../hooks/useActivities';
import { exportToCsv } from '@/core/utils/exportUtils';
import { useSearchParamState } from '@/core/hooks/useDebouncedSearchParams';

const PAGE_SIZE = 10;

const ActivitiesPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const { data: activities = [], isLoading } = useActivities();
  const [entityFilter, setEntityFilter] = useSearchParamState('entity', 'all');
  const [statusFilter, setStatusFilter] = useSearchParamState('status', 'all');
  const [pageParam, setPageParam] = useSearchParamState('page', '1');
  const page = Math.max(1, Number(pageParam) || 1);

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

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const selectedActivity = filteredActivities.find((activity) => activity.id === selectedActivityId) ?? null;

  const handleEntityChange = (value: string) => {
    setEntityFilter(value);
    setPageParam('1');
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPageParam('1');
  };

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
            onEntityChange={handleEntityChange}
            onStatusChange={handleStatusChange}
          />
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 shadow-sm">
            <div className="flex">
              <ActivityTable
                activities={paginatedActivities}
                selectedId={selectedActivityId}
                onSelectRow={setSelectedActivityId}
                isLoading={isLoading}
              />
              <ActivityDetail key={selectedActivity?.id ?? 'none'} activity={selectedActivity} />
            </div>

            {filteredActivities.length > 0 && (
              <div className="px-5 py-3 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/30">
                <span className="text-xs text-on-surface-variant">
                  Sayfa <span className="font-semibold text-on-background">{currentPage}</span> / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageParam(String(currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Önceki
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageParam(String(currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Sonraki
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesPage;
