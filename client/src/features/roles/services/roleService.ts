import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import { addMockRole, getMockRoles, syncMockRolePermissions } from "./roleService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { CreatedRoleResponseDto, CreateRoleRequest, RoleResponseDto } from "../types/roleTypes";

export const roleService = {
  getAllRoles: async (): Promise<ApiResponse<RoleResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockRoles(), "Demo rol listesi görüntüleniyor.");
    }
    return await apiClient<RoleResponseDto[]>("/roles");
  },

  createRole: async (request: CreateRoleRequest): Promise<ApiResponse<CreatedRoleResponseDto>> => {
    if (isDemoModeActive()) {
      const newRole = addMockRole(request);
      return createMockResponse<CreatedRoleResponseDto>(
        { id: newRole.id, name: newRole.name },
        `${newRole.name} rolü oluşturuldu (demo).`
      );
    }
    return await apiClient<CreatedRoleResponseDto>("/roles", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  syncRolePermissions: async (roleId: string, permissionIds: string[]): Promise<ApiResponse<null>> => {
    if (isDemoModeActive()) {
      syncMockRolePermissions(roleId, permissionIds);
      return createMockResponse(null, "Rol izinleri güncellendi (demo).");
    }
    return await apiClient<null>(`/rolepermissions/sync/${roleId}`, {
      method: "POST",
      body: JSON.stringify(permissionIds),
    });
  },
};
