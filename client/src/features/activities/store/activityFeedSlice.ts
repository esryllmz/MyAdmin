import { createSlice, nanoid } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ActivityEventType = "role-change" | "status-toggle" | "user-delete" | "demo-role-switch";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: string;
  message: string;
  timestamp: string;
  isSuccess: boolean;
}

export interface ActivityFeedState {
  events: ActivityEvent[];
}

const MAX_EVENTS = 30;

const initialState: ActivityFeedState = {
  events: [],
};

type LogActivityPayload = Omit<ActivityEvent, "id" | "timestamp">;

const activityFeedSlice = createSlice({
  name: "activityFeed",
  initialState,
  reducers: {
    logActivity: {
      reducer: (state, action: PayloadAction<ActivityEvent>) => {
        state.events.unshift(action.payload);
        if (state.events.length > MAX_EVENTS) {
          state.events.splice(MAX_EVENTS);
        }
      },
      prepare: (payload: LogActivityPayload) => ({
        payload: {
          ...payload,
          id: nanoid(),
          timestamp: new Date().toISOString(),
        },
      }),
    },
  },
});

export const { logActivity } = activityFeedSlice.actions;
export default activityFeedSlice.reducer;
