import { useQuery } from "@tanstack/react-query";
import { activityService, type OperationalActivityParams } from "../services/activityService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { ActivityResponseDto } from "../types/activityTypes";

export const useActivities = () => {
  return useQuery<ApiResponse<ActivityResponseDto[]>, ApiResponse<null>, ActivityResponseDto[]>({
    queryKey: ["activities"],
    queryFn: activityService.getAllActivities,
    select: (response) => response.data || [],
  });
};

/** Personal activity feed (GET /activities/me) — safe for every authenticated role, including Viewer. */
export const useMyActivities = () => {
  return useQuery<ApiResponse<ActivityResponseDto[]>, ApiResponse<null>, ActivityResponseDto[]>({
    queryKey: ["activities", "me"],
    queryFn: activityService.getMyActivities,
    select: (response) => response.data || [],
  });
};

/** Editor's operations feed (GET /activities/operations) — Viewer account + Team events only. */
export const useOperationalActivities = (params: OperationalActivityParams = {}) => {
  return useQuery<ApiResponse<ActivityResponseDto[]>, ApiResponse<null>, ActivityResponseDto[]>({
    queryKey: ["activities", "operations", params],
    queryFn: () => activityService.getOperationalActivities(params),
    select: (response) => response.data || [],
  });
};
