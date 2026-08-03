import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Skeleton } from "@/core/components/ui/skeleton";
import { formatRelativeTime } from "@/core/utils/formatRelativeTime";
import { setNotificationCenterOpen } from "@/core/store/uiSlice";
import type { RootState } from "@/core/store/store";
import type { NotificationResponseDto } from "../types/notificationTypes";
import { useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications } from "../hooks/useNotifications";

const TYPE_ICONS: Record<string, typeof Info> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: XCircle,
};

const TYPE_COLORS: Record<string, string> = {
  INFO: "text-info bg-info/10",
  SUCCESS: "text-success bg-success/10",
  WARNING: "text-warning bg-warning/10",
  ERROR: "text-error bg-error/10",
};

const PREVIEW_COUNT = 5;

/**
 * Header quick-look only — last 5 notifications, unread count, mark all as read, and a link to
 * the full /notifications page. Full management (filters, delete, clear all) lives on that page
 * only, so this popup and the full page share the same query cache instead of duplicating state.
 */
export const NotificationCenter = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isNotificationCenterOpen);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const preview = notifications.slice(0, PREVIEW_COUNT);

  const handleViewAll = () => {
    dispatch(setNotificationCenterOpen(false));
    navigate("/notifications");
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => dispatch(setNotificationCenterOpen(open))}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface transition-all relative p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount > 99 ? "99+" : unreadCount} unread)` : ""}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-error text-white text-[9px] font-bold border-2 border-surface-container-lowest dark:border-dark-surface-container-low">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/60 dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm">Notifications</h3>
            <p className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">{unreadCount} unread</p>
          </div>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="text-xs font-semibold text-on-surface dark:text-dark-on-surface hover:opacity-70 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
          >
            Mark all as read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-4 flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                </div>
              </div>
            ))
          ) : preview.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-2 text-center">
              <Bell className="w-8 h-8 text-on-surface-variant/20 dark:text-dark-on-surface-variant/20" />
              <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                You don't have any notifications yet.
              </p>
            </div>
          ) : (
            preview.map((notification: NotificationResponseDto) => {
              const Icon = TYPE_ICONS[notification.type] ?? Info;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => !notification.isRead && markAsRead.mutate(notification.id)}
                  className={`group w-full text-left p-4 flex gap-3 transition-colors hover:bg-surface-container-low/60 dark:hover:bg-dark-surface-container-low/60 ${!notification.isRead ? "bg-on-surface/[0.03] dark:bg-dark-on-surface/[0.04]" : ""
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLORS[notification.type] ?? TYPE_COLORS.INFO
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface dark:bg-dark-on-surface mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 dark:text-dark-on-surface-variant/60 mt-1">
                      {formatRelativeTime(notification.createdDate)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="p-2 border-t border-outline-variant/60 dark:border-dark-outline-variant">
          <button
            type="button"
            onClick={handleViewAll}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high px-3 py-2 rounded-md transition-colors"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
