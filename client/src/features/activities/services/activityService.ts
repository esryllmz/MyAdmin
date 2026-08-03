import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import { getMockActivities } from "./activityService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { ActivityResponseDto } from "../types/activityTypes";

export const activityService = {
  getAllActivities: async (): Promise<ApiResponse<ActivityResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockActivities(), "Demo aktivite kayıtları görüntüleniyor.");
    }
    return await apiClient<ActivityResponseDto[]>("/activities");
  },

  /** Current user's own activity only — server scopes this by the JWT subject, not a param. */
  getMyActivities: async (): Promise<ApiResponse<ActivityResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockActivities(), "Demo aktivite kayıtları görüntüleniyor.");
    }
    return await apiClient<ActivityResponseDto[]>("/activities/me");
  },
};
