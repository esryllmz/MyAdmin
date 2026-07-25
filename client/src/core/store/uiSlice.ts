import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  isNotificationCenterOpen: boolean;
  isSidebarCollapsed: boolean;
  notificationFilter: "all" | "unread" | "security" | "system" | "activity";
}

const initialState: UiState = {
  isNotificationCenterOpen: false,
  isSidebarCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
  notificationFilter: "all",
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
    setNotificationFilter: (state, action: PayloadAction<UiState["notificationFilter"]>) => {
      state.notificationFilter = action.payload;
    },
  },
});

export const {
  openNotificationCenter,
  setNotificationCenterOpen,
  toggleSidebarCollapsed,
  setNotificationFilter,
} = uiSlice.actions;
export default uiSlice.reducer;
