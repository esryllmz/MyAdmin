import { useQuery } from "@tanstack/react-query";
import { permissionService } from "../services/permissionService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PermissionResponseDto } from "../types/permissionTypes";

export const usePermissions = () => {
  return useQuery<ApiResponse<PermissionResponseDto[]>, ApiResponse<null>, PermissionResponseDto[]>({
    queryKey: ["permissions"],
    queryFn: permissionService.getAllPermissions,
    select: (response) => response.data || [],
  });
};
