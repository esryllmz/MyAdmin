import { apiClient } from "@/core/api/apiClient";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { RegisterUserRequest, CreatedUserResponseDto } from "@/features/auth/types/authTypes";
import type { UserResponseDto } from "../types/userTypes";

export const userService = {

  getAllUsers: async (): Promise<ApiResponse<UserResponseDto[]>> => {
    return await apiClient<UserResponseDto[]>("/users");
  },

  inviteUser: async (request: RegisterUserRequest): Promise<ApiResponse<CreatedUserResponseDto>> =>
    await apiClient<CreatedUserResponseDto>("/authentication/register", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  updateUserByAdmin: async (_id: string, request: FormData): Promise<ApiResponse<null>> =>
    await apiClient<null>("/users/profile", {
      method: "PUT",
      body: request,
    })
};
