import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type Density = "comfortable" | "compact";
export type FontSize = "sm" | "md" | "lg";

export interface UiState {
  isNotificationCenterOpen: boolean;
  isSidebarCollapsed: boolean;
  notificationFilter: "all" | "unread" | "security" | "system" | "activity";
  density: Density;
  fontSize: FontSize;
  reducedMotion: boolean;
}

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const readStoredDensity = (): Density => (localStorage.getItem("density") === "compact" ? "compact" : "comfortable");
const readStoredFontSize = (): FontSize => {
  const stored = localStorage.getItem("fontSize");
  return stored === "sm" || stored === "lg" ? stored : "md";
};
const readStoredReducedMotion = (): boolean => {
  const stored = localStorage.getItem("reducedMotion");
  return stored === null ? prefersReducedMotion : stored === "true";
};

const initialState: UiState = {
  isNotificationCenterOpen: false,
  isSidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
  notificationFilter: "all",
  density: readStoredDensity(),
  fontSize: readStoredFontSize(),
  reducedMotion: readStoredReducedMotion(),
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openNotificationCenter: (state) => {
      state.isNotificationCenterOpen = true;
    },
    setNotificationCenterOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationCenterOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      localStorage.setItem("sidebarCollapsed", String(state.isSidebarCollapsed));
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
      localStorage.setItem("sidebarCollapsed", String(state.isSidebarCollapsed));
    },
    setNotificationFilter: (state, action: PayloadAction<UiState["notificationFilter"]>) => {
      state.notificationFilter = action.payload;
    },
    setDensity: (state, action: PayloadAction<Density>) => {
      state.density = action.payload;
      localStorage.setItem("density", action.payload);
    },
    setFontSize: (state, action: PayloadAction<FontSize>) => {
      state.fontSize = action.payload;
      localStorage.setItem("fontSize", action.payload);
    },
    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.reducedMotion = action.payload;
      localStorage.setItem("reducedMotion", String(action.payload));
    },
  },
});

export const {
  openNotificationCenter,
  setNotificationCenterOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setNotificationFilter,
  setDensity,
  setFontSize,
  setReducedMotion,
} = uiSlice.actions;
export default uiSlice.reducer;
