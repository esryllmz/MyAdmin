import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/core/store/store";
import { ToastProvider } from "./ToastProvider";
import { ThemeProvider } from "@/core/theme/ThemeContext";
import { RealtimeBridge } from "@/core/realtime/RealtimeBridge";
import { AppearanceEffects } from "@/core/components/AppearanceEffects";
import type { ApiResponse } from "@/core/types/ApiResponse";

const isClientError = (error: unknown): boolean => {
  const statusCode = (error as Partial<ApiResponse<unknown>> | undefined)?.statusCode;
  return typeof statusCode === "number" && statusCode >= 400 && statusCode < 500;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // 401/403/404/400 gibi istemci hataları tekrar denenerek düzelmez —
      // yalnızca ağ/sunucu hatalarında (5xx, bağlantı kopması) bir kez tekrar dene.
      // Aksi halde her başarısız istek (ör. yetkisiz bir GET) iki kez toast üretir.
      retry: (failureCount, error) => {
        if (isClientError(error)) return false;
        return failureCount < 1;
      },
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ToastProvider>
              {children}
              <RealtimeBridge />
              <AppearanceEffects />
            </ToastProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  );
};
