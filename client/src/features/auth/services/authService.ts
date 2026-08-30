import { apiClient } from "@/core/api/apiClient";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type {
  LoginRequest,
  RegisterUserRequest,
  TokenResponseDto,
  CreatedUserResponseDto
} from "../types/authTypes";

export const authService = {
  login: async (request: LoginRequest): Promise<ApiResponse<TokenResponseDto>> =>
    await apiClient<TokenResponseDto>("/authentication/login", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  register: async (request: RegisterUserRequest): Promise<ApiResponse<CreatedUserResponseDto>> =>
    await apiClient<CreatedUserResponseDto>("/authentication/register", {
      method: "POST",
      body: JSON.stringify(request),
    }),

  refreshToken: async (): Promise<ApiResponse<TokenResponseDto>> =>
    await apiClient<TokenResponseDto>("/authentication/refresh-token", {
      method: "POST",
    }),

  // The refresh token lives in an HttpOnly cookie the browser attaches automatically — there is
  // nothing for the client to read or send explicitly.
  logout: async (): Promise<ApiResponse<null>> =>
    await apiClient<null>("/authentication/logout", {
      method: "POST",
    })
};