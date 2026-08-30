import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { authService } from "../services/authService";
import { setCredentials, logout as logoutAction } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import type { LoginRequest, RegisterUserRequest } from "../types/authTypes";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Login Mutasyonu
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {

      if (response.success && response.data) {
        localStorage.setItem("accessToken", response.data.accessToken);

        dispatch(setCredentials(response.data.user));

        navigate("/dashboard");
      }
    },
  });

  // Register Mutasyonu
  const registerMutation = useMutation({
    mutationFn: (data: RegisterUserRequest) => authService.register(data),
    onSuccess: (response) => {

      if (response.success) {
        navigate("/login");
      }
    },
  });

  const logout = () => {
    // Best-effort: the server-side session must actually be revoked, not just forgotten
    // locally — but a failed network call must never block the user from getting logged out
    // of this device.
    authService.logout().catch(() => {
      // Intentionally ignored — local logout proceeds regardless.
    }).finally(() => {
      dispatch(logoutAction());
      navigate("/login");
    });
  };

  return {
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
};