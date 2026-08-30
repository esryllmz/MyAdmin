import type { UserResponseDto } from "@/features/users/types/userTypes";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponseDto {
  accessToken: string;
  expiration: string;
  user: UserResponseDto;
}

export interface CreatedUserResponseDto {
  id: string;
  username: string;
  email: string;
}