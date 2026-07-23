import type { PermissionResponseDto } from "@/features/permissions/types/permissionTypes";

export type { PermissionResponseDto };

export interface RoleResponseDto {
  id: string;
  name: string;
  description: string | null;
  label: string | null;
  createdDate: string;
  updatedDate: string | null;
  permissions: PermissionResponseDto[];
}

export interface CreateRoleRequest {
  name: string;
  description: string | null;
  label: string | null;
}

export interface UpdateRoleRequest {
  name: string;
  description: string | null;
  label: string | null;
}

export interface CreatedRoleResponseDto {
  id: string;
  name: string;
}

export interface RolePreviewDto {
  id: string;
  name: string;
  label: string | null;
}