import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";
import activityFeedReducer from "../../features/activities/store/activityFeedSlice";
import uiReducer from "./uiSlice";

/**
 * Root Store Yapılandırması
 * 'core/store' klasörü, tüm özelliklerin state'lerini birleştirdiğimiz merkezdir.
 */
export const store = configureStore({
  reducer: {
    // Özellik bazlı reducer'ları buraya ekliyoruz
    auth: authReducer,
    activityFeed: activityFeedReducer,
    ui: uiReducer,
  },
  // Veri tipi güvenliği için middleware ayarları
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// TypeScript için gerekli tip tanımlamaları
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;