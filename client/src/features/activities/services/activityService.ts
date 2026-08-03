import { apiClient } from "@/core/api/apiClient";
import { createMockResponse, isDemoModeActive } from "@/core/api/demoMode";
import { getMockActivities } from "./activityService.mock";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { ActivityResponseDto } from "../types/activityTypes";

export interface OperationalActivityParams {
  entityName?: "User" | "Team" | "TeamMember";
  from?: string;
  to?: string;
  isSuccess?: boolean;
  userId?: string;
}

const buildQuery = (params: Record<string, string | number | boolean | undefined>): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
};

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

  /**
   * Editor's "Operations Activity" / Reports data source — server-filtered to the Viewer
   * account + Team/membership action whitelist (see OperationalActivityActions on the backend),
   * so role/permission/API-key/security-policy rows are never returned here regardless of
   * filters.
   */
  getOperationalActivities: async (params: OperationalActivityParams = {}): Promise<ApiResponse<ActivityResponseDto[]>> => {
    if (isDemoModeActive()) {
      return createMockResponse(getMockActivities(), "Demo operasyon aktiviteleri görüntüleniyor.");
    }
    const query = buildQuery({
      entityName: params.entityName,
      from: params.from,
      to: params.to,
      isSuccess: params.isSuccess,
      userId: params.userId,
    });
    return await apiClient<ActivityResponseDto[]>(`/activities/operations${query}`);
  },
};
