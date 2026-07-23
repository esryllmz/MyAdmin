import { apiClient } from "@/core/api/apiClient";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { RoleResponseDto } from "../types/roleTypes";

export const roleService = {
  getAllRoles: async (): Promise<ApiResponse<RoleResponseDto[]>> => {
    return await apiClient<RoleResponseDto[]>("/roles");
  },
};
