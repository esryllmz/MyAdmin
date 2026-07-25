import { useState } from 'react';
import { toast } from 'react-toastify';
import { StatCard } from '../components/StatCard';
import { LiveActivityFeed } from '@/features/activities/components/LiveActivityFeed';
import { SystemHealthPanel } from '../components/SystemHealthPanel';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { exportToCsv } from '@/core/utils/exportUtils';

const DashboardPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { stats, isLoading, isDemoMode } = useDashboardStats();

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const exportData = [
        {
          Metrik: 'Toplam Kullanıcılar',
          Değer: stats.totalUsers,
          Tarih: new Date().toLocaleDateString('tr-TR'),
        },
        {
          Metrik: 'Aktif Roller',
          Değer: stats.activeRoles,
          Tarih: new Date().toLocaleDateString('tr-TR'),
        },
        {
          Metrik: 'Bugünkü Bildirimler',
          Değer: stats.todayNotifications,
          Tarih: new Date().toLocaleDateString('tr-TR'),
        },
        {
          Metrik: 'Başarısız Aktiviteler',
          Değer: stats.recentFailedActivities,
          Tarih: new Date().toLocaleDateString('tr-TR'),
        },
      ];
      exportToCsv(exportData, 'dashboard-stats');
      toast.success('Dashboard verisi CSV olarak dışa aktarıldı');
    } catch (error) {
      console.error('Export hatası:', error);
      toast.error('Dışa aktarma sırasında hata oluştu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
            System Overview
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{isDemoMode ? 'Demo verisi üzerinde canlı simülasyon.' : 'Recent activity and current system state.'}</span>
            {isDemoMode && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-info shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-info"></span>
                </span>
                Demo
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="shrink-0 bg-surface-container-lowest dark:bg-dark-surface-container-low border border-outline-variant/60 dark:border-dark-outline-variant px-4 py-2 rounded-lg text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isExporting ? 'hourglass_empty' : 'download'}
          </span>
          {isExporting ? 'İhraç ediliyor...' : 'Export'}
        </button>
      </div>

      {/* Bento Grid: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString('tr-TR')}
          subText="Kayıtlı kullanıcılar"
          icon="group"
          color="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Roles"
          value={stats.activeRoles.toLocaleString('tr-TR')}
          subText="Tanımlı roller"
          icon="badge"
          color="secondary"
          isLoading={isLoading}
        />
        <StatCard
          title="Today's Notifications"
          value={stats.todayNotifications.toLocaleString('tr-TR')}
          badge={`${stats.unreadNotifications} UNREAD`}
          icon="notifications"
          isBright
          isLoading={isLoading}
        />
        <StatCard
          title="Recent Failed Activities"
          value={stats.recentFailedActivities.toLocaleString('tr-TR')}
          subText="Requires review"
          icon="warning"
          color="error"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Area: recent activity + system health */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 min-w-0">
          <LiveActivityFeed />
        </div>
        <div className="xl:col-span-1 min-w-0">
          <SystemHealthPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
