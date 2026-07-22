import { toast } from "react-toastify";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { TokenResponseDto } from "@/features/auth/types/authTypes";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5029/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem("accessToken");
  const isDemoMode = localStorage.getItem("demoMode") === "true";
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    let response = await fetch(`${BASE_URL}${endpoint}`, config);

    // --- 401 & Refresh Token Yönetimi (Race Condition Korumalı) ---
    if (response.status === 401 && !isDemoMode && !endpoint.includes("/authentication/refresh-token")) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (isRefreshing) {
        // Zaten token yenileniyorsa, kuyruğa al
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          const newHeaders = {
            ...config.headers,
            "Authorization": `Bearer ${newToken}`,
          };
          return fetch(`${BASE_URL}${endpoint}`, { ...config, headers: newHeaders })
            .then(async (res) => {
              const text = await res.text();
              return parseResponse<T>(text, res.status);
            });
        }).catch((err) => {
          handleLogout();
          throw err;
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${BASE_URL}/authentication/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(refreshToken),
          credentials: "include",
        });

        if (refreshResponse.ok) {
          const refreshText = await refreshResponse.text();
          const refreshResult: ApiResponse<TokenResponseDto> = refreshText ? JSON.parse(refreshText) : {};

          if (refreshResult.data) {
            localStorage.setItem("accessToken", refreshResult.data.accessToken);
            localStorage.setItem("refreshToken", refreshResult.data.refreshToken);
            
            // Kuyruktaki tüm istekleri işle
            processQueue(null, refreshResult.data.accessToken);

            // Orijinal isteği yeni token ile tekrar yap
            const newHeaders = {
              ...config.headers,
              "Authorization": `Bearer ${refreshResult.data.accessToken}`,
            };
            response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers: newHeaders });
          }
        } else {
          processQueue(new Error("Oturum süresi doldu."), null);
          handleLogout();
          throw new Error("Oturum süresi doldu.");
        }
      } finally {
        isRefreshing = false;
      }
    }

    // --- Güvenli Yanıt İşleme ---
    const responseText = await response.text();
    return parseResponse<T>(responseText, response.status, options.method as string);

  } catch (error: unknown) {
    const isApiResponse = (err: unknown): err is ApiResponse<T> => {
      return (
        err !== null &&
        typeof err === 'object' &&
        'success' in err &&
        'statusCode' in err
      );
    };

    if (isApiResponse(error)) {
      if (!error.success) {
        throw error;
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Sunucuya bağlanılamadı.";
    toast.error(errorMessage);
    throw error;
  }
};

const parseResponse = <T>(responseText: string, statusCode: number, method?: string): ApiResponse<T> => {
  let result: ApiResponse<T>;

  try {
    result = responseText
      ? JSON.parse(responseText)
      : {
          success: statusCode >= 200 && statusCode < 300,
          message: statusCode >= 200 && statusCode < 300 ? "" : "Sunucudan içerik dönmedi.",
          data: null as T,
          statusCode: statusCode
        };
  } catch {
    result = {
      success: false,
      message: "Sunucu yanıtı okunamadı (Geçersiz format).",
      data: null as T,
      statusCode: statusCode
    };
  }

  if (!result.success && statusCode >= 400) {
    handleApiError(result);
    throw result;
  }

  if (method && method !== "GET" && result.message) {
    toast.success(result.message);
  }

  return result;
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("demoMode");
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
