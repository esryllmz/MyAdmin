import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Skeleton } from "@/core/components/ui/skeleton";
import { formatRelativeTime } from "@/core/utils/formatRelativeTime";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
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

export const NotificationCenter = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-on-surface-variant dark:text-dark-on-surface-variant hover:text-primary dark:hover:text-dark-primary transition-all relative p-2 rounded-full hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high"
          aria-label="Bildirimler"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-error text-white text-[9px] font-bold border-2 border-surface dark:border-dark-surface">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0 gap-0 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-on-surface text-sm">Bildirimler</h3>
            <p className="text-[11px] text-on-surface-variant">{unreadCount} okunmamış</p>
          </div>
          <button
            type="button"
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="text-xs font-semibold text-primary hover:text-primary-container disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Tümünü Okundu İşaretle
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-outline-variant/10">
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
          ) : notifications.length === 0 ? (
            <div className="p-10 flex flex-col items-center gap-2 text-center">
              <Bell className="w-8 h-8 text-on-surface-variant/20" />
              <p className="text-xs text-on-surface-variant">Henüz bir bildiriminiz yok.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = TYPE_ICONS[notification.type] ?? Info;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => !notification.isRead && markAsRead.mutate(notification.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors hover:bg-surface-container-low/60 ${!notification.isRead ? 'bg-primary/[0.03]' : ''
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
                      <p className="text-sm font-semibold text-on-surface">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-1">
                      {formatRelativeTime(notification.createdDate)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
