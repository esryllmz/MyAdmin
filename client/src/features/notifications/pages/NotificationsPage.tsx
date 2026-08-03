import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle2, Info, Settings, Trash2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Skeleton } from "@/core/components/ui/skeleton";
import { formatRelativeTime } from "@/core/utils/formatRelativeTime";
import { useSearchParamState } from "@/core/hooks/useDebouncedSearchParams";
import type { NotificationResponseDto } from "../types/notificationTypes";
import {
  CATEGORY_FILTERS,
  matchesCategoryFilter,
  severityOf,
  type NotificationCategory,
} from "../utils/notificationCategorize";
import {
  useClearAllNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useRemoveNotification,
} from "../hooks/useNotifications";

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

const SEVERITY_LABELS: Record<ReturnType<typeof severityOf>, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading, isError } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const removeNotification = useRemoveNotification();
  const clearAll = useClearAllNotifications();
  const [filter, setFilter] = useSearchParamState("filter", "all");
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filtered = useMemo(
    () => notifications.filter((notification) => matchesCategoryFilter(notification, filter as NotificationCategory)),
    [notifications, filter]
  );

  const handleClearAll = () => {
    clearAll();
    setIsClearConfirmOpen(false);
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 text-on-surface dark:text-dark-on-surface">
            Notifications
          </h2>
          <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            {unreadCount === 0 ? "You're all caught up." : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest px-3.5 py-2 text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Mark all as read
          </button>
          <button
            type="button"
            onClick={() => setIsClearConfirmOpen(true)}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest px-3.5 py-2 text-sm font-medium text-error hover:bg-error/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Trash2 size={14} aria-hidden="true" />
            Clear all
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings/notifications")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 dark:border-dark-outline-variant bg-surface-container-lowest dark:bg-dark-surface-container-lowest px-3.5 py-2 text-sm font-medium text-on-surface dark:text-dark-on-surface hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
          >
            <Settings size={14} aria-hidden="true" />
            Notification settings
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto">
        {CATEGORY_FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            aria-pressed={filter === option.key}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === option.key
              ? "bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface"
              : "bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <p className="px-5 py-16 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
            Something went wrong loading your notifications. Please try again.
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Bell className="w-8 h-8 text-on-surface-variant/20 dark:text-dark-on-surface-variant/20" aria-hidden="true" />
            <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
              {notifications.length === 0 ? "You don't have any notifications yet." : "No notifications match this filter."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant/60 dark:divide-dark-outline-variant">
            {filtered.map((notification: NotificationResponseDto) => {
              const Icon = TYPE_ICONS[notification.type] ?? Info;
              const severity = severityOf(notification);

              return (
                <li
                  key={notification.id}
                  className={`group flex items-start gap-3 px-5 py-4 transition-colors ${!notification.isRead ? "bg-on-surface/[0.03] dark:bg-dark-on-surface/[0.04]" : ""
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLORS[notification.type] ?? TYPE_COLORS.INFO
                      }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold text-on-surface dark:text-dark-on-surface">{notification.title}</p>
                      {!notification.isRead && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-on-surface dark:bg-dark-on-surface"
                          aria-label="Unread"
                        />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
                        {SEVERITY_LABELS[severity]}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-on-surface-variant/70 dark:text-dark-on-surface-variant/70">
                      <span>{formatRelativeTime(notification.createdDate)}</span>
                      {notification.linkUrl && (
                        <Link
                          to={notification.linkUrl}
                          className="font-semibold text-on-surface dark:text-dark-on-surface hover:underline"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead.mutate(notification.id)}
                        title="Mark as read"
                        className="p-1.5 rounded-md text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span className="sr-only">Mark as read</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNotification(notification.id)}
                      title="Delete notification"
                      className="p-1.5 rounded-md text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Delete notification</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear all notifications</DialogTitle>
            <DialogDescription>
              This removes every notification from your list and can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:brightness-110 transition-all"
            >
              Clear all
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsPage;
