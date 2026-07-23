import type { NotificationResponseDto } from "../types/notificationTypes";

/**
 * Modül seviyesinde mutable liste — demo modunda "okundu" işaretleme oturum
 * boyunca kalıcı olsun diye (aksi halde her invalidateQueries sonrası mock
 * veri sıfırlanıp okunmamış görünürdü).
 */
let mockNotifications: NotificationResponseDto[] = [
  {
    id: "mock-notif-01",
    title: "Yeni kullanıcı davet edildi",
    message: "aylin.polat sisteme eklendi ve Viewer rolüyle aktifleştirildi.",
    type: "SUCCESS",
    linkUrl: "/team",
    isRead: false,
    readAt: null,
    createdDate: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
  {
    id: "mock-notif-02",
    title: "Rol izinleri güncellendi",
    message: "Editor rolüne 'users.edit' yetkisi eklendi.",
    type: "INFO",
    linkUrl: "/roles",
    isRead: false,
    readAt: null,
    createdDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
  {
    id: "mock-notif-03",
    title: "Başarısız giriş denemesi",
    message: "gizem.arslan hesabı için 3 başarısız giriş denemesi tespit edildi.",
    type: "WARNING",
    linkUrl: "/activities",
    isRead: false,
    readAt: null,
    createdDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
  {
    id: "mock-notif-04",
    title: "Hesap pasifleştirildi",
    message: "zeynep.demir hesabı bir yönetici tarafından pasifleştirildi.",
    type: "ERROR",
    linkUrl: "/team",
    isRead: true,
    readAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
  {
    id: "mock-notif-05",
    title: "Sistem yedeklemesi tamamlandı",
    message: "Günlük veritabanı yedeklemesi başarıyla tamamlandı.",
    type: "SUCCESS",
    linkUrl: null,
    isRead: true,
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    createdDate: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
  {
    id: "mock-notif-06",
    title: "Yeni aktivite kaydı",
    message: "kaan.yildiz 'roles.delete' yetkisini kullanarak bir rol sildi.",
    type: "INFO",
    linkUrl: "/activities",
    isRead: true,
    readAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    createdDate: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(),
    userId: "mock-user-01",
  },
];

export const getMockNotifications = (): NotificationResponseDto[] =>
  mockNotifications.map((notification) => ({ ...notification }));

export const markMockNotificationAsRead = (id: string): void => {
  const now = new Date().toISOString();
  mockNotifications = mockNotifications.map((notification) =>
    notification.id === id ? { ...notification, isRead: true, readAt: now } : notification
  );
};

export const markAllMockNotificationsAsRead = (): void => {
  const now = new Date().toISOString();
  mockNotifications = mockNotifications.map((notification) =>
    notification.isRead ? notification : { ...notification, isRead: true, readAt: now }
  );
};
