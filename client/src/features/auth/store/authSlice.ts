import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserResponseDto } from "@/features/users/types/userTypes";

interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const storedUser = localStorage.getItem("user");
const token = localStorage.getItem("accessToken");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!token,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserResponseDto>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    updateUserInfo: (state, action: PayloadAction<{ username: string; profileImageUrl?: string }>) => {
      if (state.user) {
        state.user.username = action.payload.username;

        if (action.payload.profileImageUrl !== undefined) {
          state.user.profileImageUrl = action.payload.profileImageUrl;
        }
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
