import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { NotificationResponseDto } from "../types/notificationTypes";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];

type NotificationsResponse = ApiResponse<NotificationResponseDto[]>;

export const useNotifications = () => {
  return useQuery<NotificationsResponse, ApiResponse<null>, NotificationResponseDto[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationService.getMyNotifications,
    select: (response) => response.data || [],
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY);

      queryClient.setQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old
          ? {
              ...old,
              data: (old.data ?? []).map((notification) =>
                notification.id === id
                  ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                  : notification
              ),
            }
          : old
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY);

      queryClient.setQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old
          ? {
              ...old,
              data: (old.data ?? []).map((notification) =>
                notification.isRead
                  ? notification
                  : { ...notification, isRead: true, readAt: new Date().toISOString() }
              ),
            }
          : old
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};
