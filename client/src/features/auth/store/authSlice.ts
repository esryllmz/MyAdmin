import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserResponseDto } from "@/features/users/types/userTypes";

// Aşama 2 Düzeltmesi: isLoading alanı eklendi
interface AuthState {
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Hydration (localStorage'dan yükleme) tamamlanıp tamamlanmadığını takip eder
}

const storedUser = localStorage.getItem("user");
const token = localStorage.getItem("accessToken");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!token,
  isLoading: true, // İlk yüklemede true, ProtectedRoute sayfayı bekletir
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<UserResponseDto>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false; // Yükleme tamamlandı
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
    // Aşama 2 Düzeltmesi: Hydration tamamlandığında çağrılacak action
    initializeAuth: (state) => {
      state.isLoading = false;
    },
  },
});

export const { setCredentials, logout, updateUserInfo, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
