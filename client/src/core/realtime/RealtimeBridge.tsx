import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { logActivity, type ActivityEventType } from "@/features/activities/store/activityFeedSlice";
import { isDemoModeActive } from "@/core/api/demoMode";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { ActivityResponseDto } from "@/features/activities/types/activityTypes";
import { realtimeEventBus, type RealtimeEvent, type RealtimeEventType } from "./realtimeEventBus";

const ACTIVITIES_QUERY_KEY = ["activities"];

const FEED_EVENT_TYPE: Record<RealtimeEventType, ActivityEventType> = {
  USER_INVITED: "user-invite",
  USER_DELETED: "user-delete",
  USER_STATUS_CHANGED: "status-toggle",
  ROLE_SYNCED: "role-change",
  ROLE_CREATED: "role-create",
  SETTINGS_UPDATED: "settings-update",
  SYSTEM_HEALTH_UPDATED: "system-health",
};

const LOG_ACTION: Record<RealtimeEventType, { action: string; entityName: string }> = {
  USER_INVITED: { action: "CREATE", entityName: "User" },
  USER_DELETED: { action: "DELETE", entityName: "User" },
  USER_STATUS_CHANGED: { action: "UPDATE", entityName: "User" },
  ROLE_SYNCED: { action: "SYNC_PERMISSIONS", entityName: "Role" },
  ROLE_CREATED: { action: "CREATE", entityName: "Role" },
  SETTINGS_UPDATED: { action: "UPDATE", entityName: "Settings" },
  SYSTEM_HEALTH_UPDATED: { action: "HEALTH_CHECK", entityName: "System" },
};

const HEARTBEAT_INTERVAL_MS = 25000;

const toActivityRecord = (event: RealtimeEvent): ActivityResponseDto => {
  const { action, entityName } = LOG_ACTION[event.type];
  return {
    id: event.id,
    action,
    entityName,
    entityId: event.entityId ?? null,
    oldValues: null,
    newValues: JSON.stringify({ description: event.description }),
    ipAddress: null,
    isSuccess: event.status === "success",
    userId: null,
    userName: event.actor,
    createdDate: event.timestamp,
  };
};

/**
 * Uygulama kökünde tek sefer mount edilir. `realtimeEventBus`'a abone olup her
 * event'i iki yere yayar: Redux `activityFeed` (Dashboard'daki Canlı Hareket
 * Akışı) ve TanStack Query `["activities"]` cache'i (Activity Log sayfası ve
 * useDashboardStats). Böylece mutasyonlar tam sayfa yenileme olmadan her iki
 * yüzeye de anında yansır. SYSTEM_HEALTH_UPDATED yalnızca demo modunda,
 * periyodik bir "canlı" nabız olarak yayınlanır ve Activity Log'u kirletmemek
 * için sadece Redux akışına gider.
 */
export const RealtimeBridge = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = realtimeEventBus.subscribe((event) => {
      dispatch(
        logActivity({
          type: FEED_EVENT_TYPE[event.type],
          actor: event.actor,
          message: event.description,
          isSuccess: event.status === "success",
        })
      );

      if (event.type === "SYSTEM_HEALTH_UPDATED") return;

      queryClient.setQueryData<ApiResponse<ActivityResponseDto[]>>(ACTIVITIES_QUERY_KEY, (old) => {
        const record = toActivityRecord(event);
        if (!old) {
          return { success: true, message: "Canlı aktivite akışı.", data: [record], statusCode: 200 };
        }
        return { ...old, data: [record, ...(old.data ?? [])] };
      });
    });

    return unsubscribe;
  }, [dispatch, queryClient]);

  useEffect(() => {
    if (!isDemoModeActive()) return;

    const interval = window.setInterval(() => {
      realtimeEventBus.publish({
        type: "SYSTEM_HEALTH_UPDATED",
        title: "Sistem Sağlık Kontrolü",
        description: "Tüm servisler nominal — health-check tamamlandı.",
        actor: "System Monitor",
        status: "success",
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return null;
};
