import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  isNotificationCenterOpen: boolean;
}

const initialState: UiState = {
  isNotificationCenterOpen: false,
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
  },
});

export const { openNotificationCenter, setNotificationCenterOpen } = uiSlice.actions;
export default uiSlice.reducer;
