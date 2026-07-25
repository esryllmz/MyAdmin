import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle2, Info, Settings, Trash2, X, XCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
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
import { setNotificationCenterOpen, setNotificationFilter } from "@/core/store/uiSlice";
import type { RootState } from "@/core/store/store";
import type { NotificationResponseDto } from "../types/notificationTypes";
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

type FilterKey = "all" | "unread" | "security" | "system" | "activity";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
  { key: "activity", label: "User Activity" },
];

const categorize = (notification: NotificationResponseDto): FilterKey => {
  if (notification.type === "WARNING" || notification.type === "ERROR") return "security";
  if (notification.linkUrl?.startsWith("/team") || notification.linkUrl?.startsWith("/roles")) return "activity";
  return "system";
};

export const NotificationCenter = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const removeNotification = useRemoveNotification();
  const clearAll = useClearAllNotifications();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.isNotificationCenterOpen);
  const activeFilter = useSelector((state: RootState) => state.ui.notificationFilter);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
    return notifications.filter((n) => categorize(n) === activeFilter);
  }, [notifications, activeFilter]);

  const handleClearAll = () => {
    clearAll();
    setIsClearConfirmOpen(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={(open) => dispatch(setNotificationCenterOpen(open))}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-on-surface dark:hover:text-dark-on-surface transition-all relative p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
            aria-label={`Bildirimler${unreadCount > 0 ? ` (${unreadCount > 99 ? "99+" : unreadCount} okunmamış)` : ""}`}
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
              <h3 className="font-bold text-on-surface dark:text-dark-on-surface text-sm">Bildirimler</h3>
              <p className="text-[11px] text-on-surface-variant dark:text-dark-on-surface-variant">{unreadCount} okunmamış</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => markAllAsRead.mutate()}
                disabled={unreadCount === 0 || markAllAsRead.isPending}
                className="text-xs font-semibold text-on-surface dark:text-dark-on-surface hover:opacity-70 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
              >
                Tümünü okundu işaretle
              </button>
              <button
                type="button"
                onClick={() => navigate("/settings/notifications")}
                title="Bildirim ayarlarına git"
                className="p-1.5 rounded-md text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high hover:text-on-surface dark:hover:text-dark-on-surface transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-1 px-3 py-2 border-b border-outline-variant/60 dark:border-dark-outline-variant overflow-x-auto">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => dispatch(setNotificationFilter(filter.key))}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${activeFilter === filter.key
                    ? "bg-on-surface dark:bg-dark-on-surface text-surface dark:text-dark-surface"
                    : "bg-surface-container-low dark:bg-dark-surface-container-low text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
                  }`}
              >
                {filter.label}
              </button>
            ))}
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
            ) : filteredNotifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center gap-2 text-center">
                <Bell className="w-8 h-8 text-on-surface-variant/20 dark:text-dark-on-surface-variant/20" />
                <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">
                  {activeFilter === "all" ? "Henüz bir bildiriminiz yok." : "Bu filtreyle eşleşen bildirim yok."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.type] ?? Info;

                return (
                  <div
                    key={notification.id}
                    className={`group w-full text-left p-4 flex gap-3 transition-colors hover:bg-surface-container-low/60 dark:hover:bg-dark-surface-container-low/60 ${!notification.isRead ? 'bg-on-surface/[0.03] dark:bg-dark-on-surface/[0.04]' : ''
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => !notification.isRead && markAsRead.mutate(notification.id)}
                      className="flex gap-3 flex-1 min-w-0 text-left"
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
                    <button
                      type="button"
                      onClick={() => removeNotification(notification.id)}
                      title="Bildirimi sil"
                      className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 h-fit rounded-md text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-outline-variant/60 dark:border-dark-outline-variant">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-error hover:bg-error/10 px-3 py-2 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Tümünü temizle
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Tüm bildirimleri temizle</DialogTitle>
            <DialogDescription>
              Bu işlem tüm bildirimlerinizi listeden kaldırır ve geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsClearConfirmOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:brightness-110 transition-all"
            >
              Tümünü Temizle
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
