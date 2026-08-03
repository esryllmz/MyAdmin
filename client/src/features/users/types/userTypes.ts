import type { RoleResponseDto } from "@/features/roles/types/roleTypes";

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  profileImageUrl: string | null;
  bio: string | null;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
  roles: RoleResponseDto[];
}

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  profileImageUrl: string | null;
  bio: string | null;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  bio: string | null;
  imageFile: File | null;
}

export interface CreatedUserResponseDto {
  id: string;
  username: string;
  email: string;
}

export interface UserPreviewDto {
  id: string;
  username: string;
  profileImageUrl: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

/** Editor/Admin-only Viewer account creation — no role field, backend always assigns Viewer. */
export interface CreateViewerAccountRequest {
  username: string;
  email: string;
  temporaryPassword: string;
}

export interface ManageableUsersParams {
  search?: string;
  isActive?: boolean;
  teamId?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}