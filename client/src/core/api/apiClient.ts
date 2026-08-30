import { toast } from "react-toastify";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { TokenResponseDto } from "@/features/auth/types/authTypes";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5029/api";

// Single-flight refresh coordinator: while a refresh is in flight, every concurrent caller
// awaits this exact same Promise instead of starting its own HTTP request. This is what keeps
// N simultaneous 401s from firing N refresh requests (and, on the backend, tripping refresh-token
// replay detection against its own legitimate rotation). The refresh token itself never touches
// this module — it lives in an HttpOnly cookie the browser attaches automatically.
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshResponse = await fetch(`${BASE_URL}/authentication/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshResponse.ok) {
      throw new Error("Oturum süresi doldu.");
    }

    const refreshText = await refreshResponse.text();
    const refreshResult: ApiResponse<TokenResponseDto> = refreshText ? JSON.parse(refreshText) : {};

    if (!refreshResult.data) {
      throw new Error("Oturum süresi doldu.");
    }

    localStorage.setItem("accessToken", refreshResult.data.accessToken);

    return refreshResult.data.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
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
    // Not: login/register uçları kimlik doğrulama denemesinin kendisidir — bunlarda dönen 401
    // (hatalı e-posta/şifre) bir "oturum süresi doldu" durumu değildir, bu yüzden sessiz
    // refresh-token akışına asla girmemeli. Aksi halde gerçek hata mesajı kaybolur.
    const isAuthAttemptEndpoint =
      endpoint.includes("/authentication/refresh-token") ||
      endpoint.includes("/authentication/login") ||
      endpoint.includes("/authentication/register");

    if (response.status === 401 && !isDemoMode && !isAuthAttemptEndpoint) {
      try {
        const newAccessToken = await refreshAccessToken();

        const retryHeaders = new Headers(config.headers);
        retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

        response = await fetch(`${BASE_URL}${endpoint}`, { ...config, headers: retryHeaders });
      } catch (err) {
        handleLogout();
        throw err;
      }
    }

    // --- Güvenli Yanıt İşleme ---
    // login/register kendi sayfalarında (LoginPage/RegisterPage) özel, İngilizce, alan bazlı
    // inline hata mesajları gösteriyor (bkz. features/auth/utils/authErrorMessages.ts) — bu
    // yüzden bu iki uç için apiClient'ın kendi genel (backend kaynaklı, Türkçe) toast'ı
    // bastırılır. Diğer tüm uygulama uçları mevcut toast davranışını korur.
    const responseText = await response.text();
    return parseResponse<T>(responseText, response.status, options.method, isAuthAttemptEndpoint);

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

    // Sadece gerçek bir ağ/bağlantı hatası burada yakalanır (handleApiError'a
    // hiç uğramadan) — bu yüzden bu tek toast tüm eşzamanlı istekler için
    // sabit bir id ile birikmeden gösterilir.
    const errorMessage = error instanceof Error ? error.message : "Sunucuya bağlanılamadı.";
    toast.error(errorMessage, { toastId: "network-error" });
    throw error;
  }
};

const parseResponse = <T>(
  responseText: string,
  statusCode: number,
  method?: string,
  suppressToast = false
): ApiResponse<T> => {
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
    if (!suppressToast) {
      handleApiError(result, method);
    }
    throw result;
  }

  if (method && method !== "GET" && result.message) {
    toast.success(result.message);
  }

  return result;
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("demoMode");
  window.location.href = "/login";
};

const handleApiError = (errorResponse: ApiResponse<unknown>, method?: string) => {
  const { statusCode, message, errors } = errorResponse;
  const isMutation = !!method && method.toUpperCase() !== "GET";

  switch (statusCode) {
    case 401:
      // Genellikle refresh logic tarafından halledilir
      break;
    case 403:
      // Sayfa açılışındaki arka plan GET isteklerinde (ör. Dashboard'un
      // useUsers/useRoles/useActivities/useNotifications sorguları) 403 sessizce
      // yutulur — bu gerçek bir kullanıcı aksiyonu değil. Yalnızca kullanıcının
      // tetiklediği bir mutasyon (POST/PUT/PATCH/DELETE) 403 alırsa toast
      // gösterilir; sabit toastId ile aynı anda birden fazla mutasyon
      // başarısız olsa bile tek bir toast görünür.
      if (isMutation) {
        toast.error("Bu işlem için yetkiniz bulunmamaktadır.", { toastId: "permission-denied" });
      }
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
      // Sabit toastId: TanStack Query'nin 5xx için tek seferlik retry'ı aynı
      // istek için ikinci bir istek daha atar — toastId olmadan bu iki toast
      // üretir (toast spam).
      toast.error("Sunucu tarafında bir hata oluştu.", { toastId: "server-error" });
      break;
    default:
      toast.error(message || "Bir hata oluştu.");
      break;
  }
};
