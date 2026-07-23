import type { ApiResponse } from "@/core/types/ApiResponse";

/**
 * Demo token'ları (`demo.<role>.access-token`) gerçek imzalı JWT değil — backend'e
 * gönderilirse 401 döner. Bu yüzden demo modunda liste/okuma servisleri network'e hiç
 * çıkmadan bu yardımcı ile zengin mock veri döndürür; gerçek girişte normal akış sürer.
 */
export const isDemoModeActive = (): boolean => localStorage.getItem("demoMode") === "true";

export const createMockResponse = <T>(data: T, message = "Demo verisi görüntüleniyor."): ApiResponse<T> => ({
  success: true,
  message,
  data,
  statusCode: 200,
});
