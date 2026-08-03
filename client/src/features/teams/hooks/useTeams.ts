import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/teamService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PagedResult } from "@/core/types/PagedResult";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  TeamListParams,
  TeamMemberResponseDto,
  TeamResponseDto,
  UpdateTeamMemberRequest,
  UpdateTeamRequest,
} from "../types/teamTypes";

const TEAMS_KEY = "teams";

export const useTeams = (params: TeamListParams = {}) => {
  return useQuery<ApiResponse<PagedResult<TeamResponseDto>>, ApiResponse<null>, PagedResult<TeamResponseDto>>({
    queryKey: [TEAMS_KEY, params],
    queryFn: () => teamService.getAllTeams(params),
    select: (response) => response.data ?? { items: [], totalCount: 0, page: 1, pageSize: params.pageSize ?? 20 },
  });
};

export const useTeam = (id: string | undefined) => {
  return useQuery<ApiResponse<TeamResponseDto>, ApiResponse<null>, TeamResponseDto | null>({
    queryKey: [TEAMS_KEY, id],
    queryFn: () => teamService.getTeamById(id!),
    select: (response) => response.data ?? null,
    enabled: !!id,
  });
};

export const useTeamMembers = (teamId: string | undefined) => {
  return useQuery<ApiResponse<TeamMemberResponseDto[]>, ApiResponse<null>, TeamMemberResponseDto[]>({
    queryKey: [TEAMS_KEY, teamId, "members"],
    queryFn: () => teamService.getMembers(teamId!),
    select: (response) => response.data ?? [],
    enabled: !!teamId,
  });
};

export const useTeamActivities = (teamId: string | undefined) => {
  return useQuery({
    queryKey: [TEAMS_KEY, teamId, "activities"],
    queryFn: () => teamService.getTeamActivities(teamId!),
    select: (response) => response.data ?? [],
    enabled: !!teamId,
  });
};

export const useTeamsForUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: [TEAMS_KEY, "for-user", userId],
    queryFn: () => teamService.getTeamsForUser(userId!),
    select: (response) => response.data ?? [],
    enabled: !!userId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTeamRequest) => teamService.createTeam(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useUpdateTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateTeamRequest) => teamService.updateTeam(teamId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useUpdateTeamStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => teamService.updateTeamStatus(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useAddTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddTeamMemberRequest) => teamService.addMember(teamId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY, teamId] }),
  });
};

export const useUpdateTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateTeamMemberRequest }) =>
      teamService.updateMember(teamId, userId, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY, teamId] }),
  });
};

export const useRemoveTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY, teamId] }),
  });
};
