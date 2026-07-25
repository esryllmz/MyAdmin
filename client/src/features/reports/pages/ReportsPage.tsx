import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { UserRegistrationChart, ActivityDistributionChart } from '@/features/dashboard/components/Charts';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useUsers } from '@/features/users/hooks/useUsers';
import { useRoles } from '@/features/roles/hooks/useRoles';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { exportToCsv } from '@/core/utils/exportUtils';

const ReportsPage = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { data: users = [] } = useUsers();
  const { data: roles = [] } = useRoles();
  const { data: activities = [] } = useActivities();
  const { stats, chartData, isLoading } = useDashboardStats();

  const usersByRole = useMemo(
    () =>
      roles.map((role) => ({
        role: role.label || role.name,
        count: users.filter((user) => user.roles?.some((userRole) => userRole.id === role.id)).length,
      })),
    [roles, users]
  );

  const successRate = useMemo(() => {
    if (activities.length === 0) return 100;
    return Math.round((activities.filter((activity) => activity.isSuccess).length / activities.length) * 100);
  }, [activities]);

  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      if (usersByRole.every((row) => row.count === 0)) {
        toast.warning('Dışa aktarılacak veri yok');
        return;
      }
      exportToCsv(
        usersByRole.map((row) => ({ Rol: row.role, 'Kullanıcı Sayısı': row.count })),
        'reports-users-by-role'
      );
      toast.success('Rapor CSV olarak indirildi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = () => {
    toast.info('PDF raporu demo ortamında simüle edilmiştir — gerçek dosya üretimi bu projede aktif değildir.');
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Reports & Analytics
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">Sistem verilerinden türetilen detaylı raporlar.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="bg-surface-container-lowest text-on-surface border border-outline-variant/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="bg-surface-container-lowest text-on-surface border border-outline-variant/20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-container-highest transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString('tr-TR')}
          subText="Kayıtlı kullanıcılar"
          icon="group"
          color="primary"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Roles"
          value={stats.activeRoles.toLocaleString('tr-TR')}
          subText="Tanımlı roller"
          icon="badge"
          color="secondary"
          isLoading={isLoading}
        />
        <StatCard
          title="Success Rate"
          value={`%${successRate}`}
          subText="Aktivite başarı oranı"
          icon="check_circle"
          color="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UserRegistrationChart data={chartData.userRegistration} isLoading={isLoading} />
        <ActivityDistributionChart data={chartData.activityDistribution} isLoading={isLoading} />
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-4">Role Bazlı Kullanıcı Dağılımı</h3>
        {usersByRole.length === 0 ? (
          <p className="text-sm text-on-surface-variant">Henüz veri yok.</p>
        ) : (
          <div className="space-y-2">
            {usersByRole.map((row) => (
              <div
                key={row.role}
                className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low/50 border border-outline-variant/10"
              >
                <span className="text-sm font-medium text-on-surface">{row.role}</span>
                <span className="text-sm font-bold text-primary">{row.count} kullanıcı</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
