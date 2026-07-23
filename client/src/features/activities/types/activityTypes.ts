export interface ActivityResponseDto {
  id: string;
  action: string;
  entityName: string;
  entityId: string | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  isSuccess: boolean;
  userId: string | null;
  userName: string | null;
  createdDate: string;
}
