import { useQuery } from "@tanstack/react-query";
import { roleService } from "../services/roleService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { RoleResponseDto } from "../types/roleTypes";

export const useRoles = () => {
  return useQuery<ApiResponse<RoleResponseDto[]>, ApiResponse<null>, RoleResponseDto[]>({
    queryKey: ["roles"],
    queryFn: roleService.getAllRoles,
    select: (response) => response.data || [],
  });
};
