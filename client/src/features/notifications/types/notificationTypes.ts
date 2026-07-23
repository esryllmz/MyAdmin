export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdDate: string;
  userId: string;
}
