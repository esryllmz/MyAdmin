import { useQuery } from "@tanstack/react-query";
import { activityService } from "../services/activityService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { ActivityResponseDto } from "../types/activityTypes";

export const useActivities = () => {
  return useQuery<ApiResponse<ActivityResponseDto[]>, ApiResponse<null>, ActivityResponseDto[]>({
    queryKey: ["activities"],
    queryFn: activityService.getAllActivities,
    select: (response) => response.data || [],
  });
};
