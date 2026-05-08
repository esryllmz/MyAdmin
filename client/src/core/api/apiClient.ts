import { toast } from "react-toastify";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { TokenResponseDto } from "@/features/auth/types/authTypes";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5029/api";

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, config);

    // --- 401 & Refresh Token Yönetimi ---
    if (response.status === 401 && !endpoint.includes("/authentication/refresh-token")) {
      const refreshToken = localStorage.getItem("refreshToken");

      const refreshResponse = await fetch(`${BASE_URL}/authentication/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refreshToken),
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Güvenli parse: Refresh token yanıtı da boş gelebilir
        const refreshText = await refreshResponse.text();
        const refreshResult: ApiResponse<TokenResponseDto> = refreshText ? JSON.parse(refreshText) : {};

        if (refreshResult.data) {
          localStorage.setItem("accessToken", refreshResult.data.accessToken);
          localStorage.setItem("refreshToken", refreshResult.data.refreshToken);
          headers["Authorization"] = `Bearer ${refreshResult.data.accessToken}`;
          response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers });
        }
      } else {
        handleLogout();
        throw new Error("Oturum süresi doldu.");
      }
    }

    // --- Güvenli Yanıt İşleme ---
    const responseText = await response.text();
    let result: ApiResponse<T>;

    try {
      result = responseText
        ? JSON.parse(responseText)
        : {
          success: response.ok,
          message: response.ok ? "" : "Sunucudan içerik dönmedi.",
          data: null as T,
          statusCode: response.status
        };
    } catch {
      result = {
        success: false,
        message: "Sunucu yanıtı okunamadı (Geçersiz format).",
        data: null as T,
        statusCode: response.status
      };
    }

    // --- Hata ve Bildirim Yönetimi ---
    if (!response.ok) {
      handleApiError(result);

      throw result;
    }

    if (options.method && options.method !== "GET" && result.message) {
      toast.success(result.message);
    }

    return result;

  } catch (error: unknown) {
    const isApiResponse = (err: unknown): err is ApiResponse<T> => {
      return (
        err !== null &&
        typeof err === 'object' &&
        'success' in err &&
        'statusCode' in err
      );
    };

    // Eğer fırlatılan hata zaten bizim ApiResponse formatımızdaysa throw result
    if (isApiResponse(error)) {

      if (!error.success) {
        throw error;
      }
    }

    // Beklenmedik ağ hataları veya manuel Errorlar
    const errorMessage = error instanceof Error ? error.message : "Sunucuya bağlanılamadı.";
    toast.error(errorMessage);
    throw error;
  }
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
};

const handleApiError = (errorResponse: ApiResponse<unknown>) => {
  const { statusCode, message, errors } = errorResponse;

  switch (statusCode) {
    case 401:
      // Genellikle refresh logic tarafından halledilir
      break;
    case 403:
      toast.error("Bu işlem için yetkiniz bulunmamaktadır.");
      break;
    case 400:
      if (errors && errors.length > 0) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(message || "Hatalı istek.");
      }
      break;
    case 404:
      toast.warning(message || "Kayıt bulunamadı.");
      break;
    case 500:
      toast.error("Sunucu tarafında bir hata oluştu.");
      break;
    default:
      toast.error(message || "Bir hata oluştu.");
      break;
  }
};