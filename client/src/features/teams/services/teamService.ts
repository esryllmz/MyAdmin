import { apiClient } from "@/core/api/apiClient";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PagedResult } from "@/core/types/PagedResult";
import type { ActivityResponseDto } from "@/features/activities/types/activityTypes";
import type {
  AddTeamMemberRequest,
  CreatedTeamResponseDto,
  CreateTeamRequest,
  MyTeamMemberResponseDto,
  MyTeamResponseDto,
  TeamListParams,
  TeamMemberResponseDto,
  TeamResponseDto,
  UpdateTeamMemberRequest,
  UpdateTeamRequest,
} from "../types/teamTypes";

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

export const teamService = {
  getAllTeams: async (params: TeamListParams = {}): Promise<ApiResponse<PagedResult<TeamResponseDto>>> => {
    const query = buildQuery({
      search: params.search,
      isActive: params.isActive,
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
    });
    return await apiClient<PagedResult<TeamResponseDto>>(`/teams${query}`);
  },

  getTeamById: async (id: string): Promise<ApiResponse<TeamResponseDto>> => {
    return await apiClient<TeamResponseDto>(`/teams/${id}`);
  },

  createTeam: async (request: CreateTeamRequest): Promise<ApiResponse<CreatedTeamResponseDto>> => {
    return await apiClient<CreatedTeamResponseDto>("/teams", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  updateTeam: async (id: string, request: UpdateTeamRequest): Promise<ApiResponse<null>> => {
    return await apiClient<null>(`/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  },

  updateTeamStatus: async (id: string, isActive: boolean): Promise<ApiResponse<null>> => {
    return await apiClient<null>(`/teams/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  deleteTeam: async (id: string): Promise<ApiResponse<null>> => {
    return await apiClient<null>(`/teams/${id}`, { method: "DELETE" });
  },

  getMembers: async (teamId: string): Promise<ApiResponse<TeamMemberResponseDto[]>> => {
    return await apiClient<TeamMemberResponseDto[]>(`/teams/${teamId}/members`);
  },

  addMember: async (teamId: string, request: AddTeamMemberRequest): Promise<ApiResponse<TeamMemberResponseDto>> => {
    return await apiClient<TeamMemberResponseDto>(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  updateMember: async (
    teamId: string,
    userId: string,
    request: UpdateTeamMemberRequest
  ): Promise<ApiResponse<null>> => {
    return await apiClient<null>(`/teams/${teamId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  },

  removeMember: async (teamId: string, userId: string): Promise<ApiResponse<null>> => {
    return await apiClient<null>(`/teams/${teamId}/members/${userId}`, { method: "DELETE" });
  },

  getTeamActivities: async (teamId: string): Promise<ApiResponse<ActivityResponseDto[]>> => {
    return await apiClient<ActivityResponseDto[]>(`/teams/${teamId}/activities`);
  },

  getTeamsForUser: async (userId: string): Promise<ApiResponse<TeamResponseDto[]>> => {
    return await apiClient<TeamResponseDto[]>(`/users/${userId}/teams`);
  },

  /** Viewer's own "My Teams" — server scopes to the caller's active memberships via the JWT. */
  getMyTeams: async (): Promise<ApiResponse<MyTeamResponseDto[]>> => {
    return await apiClient<MyTeamResponseDto[]>("/teams/mine");
  },

  getMyTeamById: async (id: string): Promise<ApiResponse<MyTeamResponseDto>> => {
    return await apiClient<MyTeamResponseDto>(`/teams/mine/${id}`);
  },

  getMyTeamMembers: async (id: string): Promise<ApiResponse<MyTeamMemberResponseDto[]>> => {
    return await apiClient<MyTeamMemberResponseDto[]>(`/teams/mine/${id}/members`);
  },
};
