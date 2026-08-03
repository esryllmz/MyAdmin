import type { NotificationResponseDto } from "../types/notificationTypes";

export type NotificationCategory = "all" | "unread" | "security" | "system" | "activity";

export const CATEGORY_FILTERS: Array<{ key: NotificationCategory; label: string }> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
  { key: "activity", label: "User Activity" },
];

/**
 * Single source of truth for notification categorization — shared by the header popup
 * (NotificationCenter) and the full /notifications page so both read the same taxonomy from
 * the same real fields (type, linkUrl) instead of maintaining two divergent category models.
 */
export const categorizeNotification = (notification: NotificationResponseDto): Exclude<NotificationCategory, "all" | "unread"> => {
  if (notification.type === "WARNING" || notification.type === "ERROR") return "security";
  if (notification.linkUrl?.startsWith("/team") || notification.linkUrl?.startsWith("/roles")) return "activity";
  return "system";
};

export const matchesCategoryFilter = (notification: NotificationResponseDto, filter: NotificationCategory): boolean => {
  if (filter === "all") return true;
  if (filter === "unread") return !notification.isRead;
  return categorizeNotification(notification) === filter;
};

export type NotificationSeverity = "critical" | "warning" | "info";

export const severityOf = (notification: NotificationResponseDto): NotificationSeverity => {
  if (notification.type === "ERROR") return "critical";
  if (notification.type === "WARNING") return "warning";
  return "info";
};
