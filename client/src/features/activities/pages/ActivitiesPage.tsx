import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ActivityFilter } from '../components/ActivityFilter';
import { ActivityTable } from '../components/ActivityTable';
import { ActivityDetail } from '../components/ActivityDetail';
import { exportToCsv } from '@/core/utils/exportUtils';
import { apiClient } from '@/core/api/apiClient';

interface Activity {
  id: string;
  entityName: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: string;
}

const ActivitiesPage = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Aktiviteleri API'den çek (Aşama 3 Düzeltmesi)
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        const response = await apiClient<Activity[]>('/activities');
        return response.data || [];
      } catch (error) {
        console.warn('Activities API çalışmadı');
        return [];
      }
    },
    retry: 1,
  });

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      if (!activities || activities.length === 0) {
        toast.warning('Dışa aktarılacak aktivite yok');
        return;
      }
      exportToCsv(activities, 'activities');
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
              disabled={isExporting || !activities.length}
              className="bg-surface-container-lowest text-on-surface border border-outline-variant/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">
                {isExporting ? 'hourglass_empty' : 'download'}
              </span>
              {isExporting ? 'İhraç ediliyor...' : 'Export CSV'}
            </button>
          </div>
          <ActivityFilter />
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden flex border border-outline-variant/10 shadow-sm">
            <ActivityTable />
            <ActivityDetail />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivitiesPage;
