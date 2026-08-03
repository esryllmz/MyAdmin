import { useMemo, useState } from "react";
import { useMyActivities } from "@/features/activities/hooks/useActivities";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Personal-only dashboard data for Editor/Viewer — built exclusively from endpoints scoped to
 * the current user (GET /activities/me, GET /notifications/my-notifications). Never touches
 * /users, /roles, /permissions, or the global /activities list, which are Admin-only and would
 * 403 for these roles.
 */
export const usePersonalDashboardStats = () => {
  const { data: activities = [], isLoading: activitiesLoading, isError: activitiesError } = useMyActivities();
  const { data: notifications = [], isLoading: notificationsLoading } = useNotifications();

  const isLoading = activitiesLoading || notificationsLoading;

  // Captured once per mount (lazy initializer), not read impurely during render/memo.
  const [mountedAt] = useState(() => Date.now());

  const recentActivityCount = useMemo(() => {
    const cutoff = mountedAt - SEVEN_DAYS_MS;
    return activities.filter((activity) => new Date(activity.createdDate).getTime() >= cutoff).length;
  }, [activities, mountedAt]);

  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return {
    recentActivityCount,
    unreadNotifications,
    recentActivities: activities.slice(0, 5),
    isLoading,
    isError: activitiesError,
  };
};
