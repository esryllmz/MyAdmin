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
import type { PagedResult } from "@/core/types/PagedResult";
import type { CreatedUserResponseDto } from "@/features/auth/types/authTypes";
import type {
  ChangePasswordRequest,
  CreateViewerAccountRequest,
  ManageableUsersParams,
  UserResponseDto,
} from "../types/userTypes";

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const userService = {

  getAllUsers: async (): Promise<ApiResponse<UserResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockUsers(), "Demo kullanıcı listesi görüntüleniyor.");
    }
    return await apiClient<UserResponseDto[]>("/users");
  },

  /** Editor workspace's user list — server-scoped to Viewer-role accounts only. */
  getManageableViewers: async (params: ManageableUsersParams = {}): Promise<ApiResponse<PagedResult<UserResponseDto>>> => {
    if (isDemoModeActive()) {
      const viewers = getMockUsers().filter((u) => u.roles?.[0]?.name === "Viewer");
      return createMockResponse(
        { items: viewers, totalCount: viewers.length, page: 1, pageSize: params.pageSize ?? 20 },
        "Demo Viewer listesi görüntüleniyor."
      );
    }
    const query = buildQuery({
      search: params.search,
      isActive: params.isActive,
      teamId: params.teamId,
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
    });
    return await apiClient<PagedResult<UserResponseDto>>(`/users/manageable${query}`);
  },

  getUserById: async (id: string): Promise<ApiResponse<UserResponseDto>> => {
    if (isDemoModeActive()) {
      const user = getMockUsers().find((u) => u.id === id) ?? null;
      return createMockResponse(user as UserResponseDto, "Demo kullanıcı görüntüleniyor.");
    }
    return await apiClient<UserResponseDto>(`/users/${id}`);
  },

  createViewerAccount: async (request: CreateViewerAccountRequest): Promise<ApiResponse<CreatedUserResponseDto>> => {
    if (isDemoModeActive()) {
      const newUser = addMockUser({
        username: request.username,
        email: request.email,
        password: request.temporaryPassword,
      });
      return createMockResponse<CreatedUserResponseDto>(
        { id: newUser.id, username: newUser.username, email: newUser.email },
        `${newUser.username} demo Viewer olarak oluşturuldu.`
      );
    }
    return await apiClient<CreatedUserResponseDto>("/users/viewers", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  /** Self-service — always updates the caller's own profile (server derives the ID from the JWT). */
  updateOwnProfile: async (request: FormData): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      return createMockResponse(null, "Profile updated (demo).");
    }
    return await apiClient<null>("/users/profile", {
      method: "PUT",
      body: request,
    });
  },

  /** Admin editing a *different* user — targets the route's {id}, not the caller. Admin-only. */
  updateUserByAdmin: async (id: string, request: FormData): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      return createMockResponse(null, "User profile updated (demo).");
    }
    return await apiClient<null>(`/users/${id}`, {
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

  changePassword: async (request: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      return createMockResponse(null, "Password changed (demo).");
    }
    return await apiClient<null>("/users/change-password", {
      method: "PATCH",
      body: JSON.stringify(request),
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
