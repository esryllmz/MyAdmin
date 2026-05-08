import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { UserResponseDto } from "../types/userTypes";

export const useUsers = () => {
  return useQuery<ApiResponse<UserResponseDto[]>, ApiResponse<null>, UserResponseDto[]>({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
    select: (response) => response.data || [],
  });
};