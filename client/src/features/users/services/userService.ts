import { apiClient } from "@/core/api/apiClient";
import type { UserResponseDto } from "../types/userTypes";

export const userService = {

  getAllUsers: async () => {
    const response = await apiClient<UserResponseDto[]>("/users");

    return response;
  }
};