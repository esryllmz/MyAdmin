import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import {
  getMockNotifications,
  markAllMockNotificationsAsRead,
  markMockNotificationAsRead,
} from "./notificationService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { NotificationResponseDto } from "../types/notificationTypes";

export const notificationService = {
  getMyNotifications: async (): Promise<ApiResponse<NotificationResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockNotifications(), "Demo bildirim listesi görüntüleniyor.");
    }
    return await apiClient<NotificationResponseDto[]>("/notifications/my-notifications");
  },

  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      markMockNotificationAsRead(id);
      return createMockResponse(null, "Bildirim okundu olarak işaretlendi.");
    }
    return await apiClient<null>(`/notifications/${id}/mark-as-read`, {
      method: "PATCH",
    });
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      markAllMockNotificationsAsRead();
      return createMockResponse(null, "Tüm bildirimler okundu olarak işaretlendi.");
    }
    return await apiClient<null>("/notifications/mark-all-as-read", {
      method: "PATCH",
    });
  },
};
