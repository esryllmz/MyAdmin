import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import {
  addMockUser,
  deleteMockUser,
  getMockUsers,
  syncMockUserRole,
  updateMockUserStatus,
} from "./userService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { RegisterUserRequest, CreatedUserResponseDto } from "@/features/auth/types/authTypes";
import type { UserResponseDto } from "../types/userTypes";

export const userService = {

  getAllUsers: async (): Promise<ApiResponse<UserResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockUsers(), "Demo kullanıcı listesi görüntüleniyor.");
    }
    return await apiClient<UserResponseDto[]>("/users");
  },

  inviteUser: async (request: RegisterUserRequest): Promise<ApiResponse<CreatedUserResponseDto>> => {
    if (isDemoModeActive()) {
      const newUser = addMockUser(request);
      return createMockResponse<CreatedUserResponseDto>(
        { id: newUser.id, username: newUser.username, email: newUser.email },
        `${newUser.username} demo ekibe eklendi.`
      );
    }
    return await apiClient<CreatedUserResponseDto>("/authentication/register", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  updateUserByAdmin: async (_id: string, request: FormData): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      return createMockResponse(null, "Profil bilgileri güncellendi (demo).");
    }
    return await apiClient<null>("/users/profile", {
      method: "PUT",
      body: request,
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      deleteMockUser(id);
      return createMockResponse(null, "Kullanıcı silindi (demo).");
    }
    return await apiClient<null>(`/users/${id}`, {
      method: "DELETE",
    });
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      updateMockUserStatus(id, isActive);
      return createMockResponse(null, isActive ? "Kullanıcı aktifleştirildi (demo)." : "Kullanıcı pasifleştirildi (demo).");
    }
    return await apiClient<null>(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  syncUserRoles: async (userId: string, roleIds: string[]): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      const [roleId] = roleIds;
      if (roleId) syncMockUserRole(userId, roleId);
      return createMockResponse(null, "Rol güncellendi (demo).");
    }
    return await apiClient<null>(`/userroles/sync/${userId}`, {
      method: "POST",
      body: JSON.stringify(roleIds),
    });
  },
};
