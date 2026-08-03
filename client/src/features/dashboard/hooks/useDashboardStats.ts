import { useEffect, useMemo, useState } from "react";
import { isDemoModeActive } from "@/core/api/demoMode";
import { useActivities } from "@/features/activities/hooks/useActivities";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useRoles } from "@/features/roles/hooks/useRoles";
import { useUsers } from "@/features/users/hooks/useUsers";

export interface DashboardStats {
  totalUsers: number;
  activeRoles: number;
  todayNotifications: number;
  unreadNotifications: number;
  recentFailedActivities: number;
}

export interface RegistrationPoint {
  label: string;
  users: number;
  active: number;
}

export interface DistributionPoint {
  name: string;
  value: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const isToday = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};

/**
 * Gerçek girişte: /users, /roles, /activities, /notifications verilerinden
 * gerçek zamanlı hesaplama. Demo modunda: aynı (mock) veri tabanlı sayılara
 * yumuşak bir sinüs dalgalanması bindirilir — Dashboard'un Users/Roles/Activities
 * sayfalarındaki aynı küçük veri setiyle tutarlı kalması için kopuk, uydurma
 * büyük sayılar yerine bu yaklaşım tercih edildi.
 */
export const useDashboardStats = () => {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  const isLoading = usersLoading || rolesLoading || activitiesLoading || notificationsLoading;
  const isDemoMode = isDemoModeActive();

  const baseStats: DashboardStats = useMemo(
    () => ({
      totalUsers: users.length,
      activeRoles: roles.length,
      todayNotifications: notifications.filter((notification) => isToday(notification.createdDate)).length,
      unreadNotifications: notifications.filter((notification) => !notification.isRead).length,
      recentFailedActivities: activities.filter((activity) => !activity.isSuccess).length,
    }),
    [users, roles, notifications, activities]
  );

  const userRegistrationSeries: RegistrationPoint[] = useMemo(() => {
    const counts = new Map<string, { total: number; active: number }>();

    users.forEach((user) => {
      const date = new Date(user.createdDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = counts.get(key) ?? { total: 0, active: 0 };
      entry.total += 1;
      if (user.isActive) entry.active += 1;
      counts.set(key, entry);
    });

    return Array.from(counts.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, { total, active }]) => {
        const month = Number(key.split("-")[1]);
        return { label: MONTH_LABELS[month], users: total, active };
      });
  }, [users]);

  const activityDistributionSeries: DistributionPoint[] = useMemo(() => {
    const counts = new Map<string, number>();
    activities.forEach((activity) => {
      counts.set(activity.action, (counts.get(activity.action) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [activities]);

  const [jitterTick, setJitterTick] = useState(0);

  useEffect(() => {
    if (!isDemoMode) return;
    const interval = window.setInterval(() => setJitterTick((tick) => tick + 1), 4000);
    return () => window.clearInterval(interval);
  }, [isDemoMode]);

  const stats: DashboardStats = useMemo(() => {
    if (!isDemoMode) return baseStats;

    const wave = (seed: number) => Math.sin(jitterTick + seed) * 2;

    return {
      ...baseStats,
      todayNotifications: Math.max(0, Math.round(baseStats.todayNotifications + wave(1))),
      recentFailedActivities: Math.max(0, Math.round(baseStats.recentFailedActivities + wave(2))),
    };
  }, [baseStats, isDemoMode, jitterTick]);

  const chartData = useMemo(() => {
    if (!isDemoMode || userRegistrationSeries.length === 0) {
      return { userRegistration: userRegistrationSeries, activityDistribution: activityDistributionSeries };
    }

    const lastIndex = userRegistrationSeries.length - 1;
    const nudgedRegistration = userRegistrationSeries.map((point, index) =>
      index === lastIndex
        ? {
            ...point,
            users: Math.max(0, Math.round(point.users + Math.sin(jitterTick) * 3)),
            active: Math.max(0, Math.round(point.active + Math.sin(jitterTick + 0.5) * 2)),
          }
        : point
    );

    return { userRegistration: nudgedRegistration, activityDistribution: activityDistributionSeries };
  }, [userRegistrationSeries, activityDistributionSeries, isDemoMode, jitterTick]);

  return { stats, chartData, isLoading, isDemoMode };
};
