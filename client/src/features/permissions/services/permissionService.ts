import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import { getMockPermissions } from "./permissionService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PermissionResponseDto } from "../types/permissionTypes";

export const permissionService = {
  getAllPermissions: async (): Promise<ApiResponse<PermissionResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockPermissions(), "Demo izin kataloğu görüntüleniyor.");
    }
    return await apiClient<PermissionResponseDto[]>("/permissions");
  },
};
