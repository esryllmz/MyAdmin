import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "../services/teamService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PagedResult } from "@/core/types/PagedResult";
import type {
  AddTeamMemberRequest,
  CreateTeamRequest,
  MyTeamMemberResponseDto,
  MyTeamResponseDto,
  TeamListParams,
  TeamMemberResponseDto,
  TeamResponseDto,
  UpdateTeamMemberRequest,
  UpdateTeamRequest,
} from "../types/teamTypes";

const TEAMS_KEY = "teams";

/** Small query-key factory for Team-related queries — extends the existing [TEAMS_KEY, ...] shape. */
export const teamKeys = {
  management: (filters?: TeamListParams) => [TEAMS_KEY, filters] as const,
  mine: () => [TEAMS_KEY, "mine"] as const,
  detail: (id: string) => [TEAMS_KEY, id] as const,
  members: (id: string) => [TEAMS_KEY, id, "members"] as const,
  myMembership: (id: string) => [TEAMS_KEY, "mine", id] as const,
};

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

/** Viewer's own "My Teams" list — server-scoped to the caller's active memberships. */
export const useMyTeams = () => {
  return useQuery<ApiResponse<MyTeamResponseDto[]>, ApiResponse<MyTeamResponseDto[]>, MyTeamResponseDto[]>({
    queryKey: teamKeys.mine(),
    queryFn: () => teamService.getMyTeams(),
    select: (response) => response.data ?? [],
  });
};

export const useMyTeam = (id: string | undefined) => {
  return useQuery<ApiResponse<MyTeamResponseDto>, ApiResponse<MyTeamResponseDto>, MyTeamResponseDto | null>({
    queryKey: teamKeys.myMembership(id ?? ""),
    queryFn: () => teamService.getMyTeamById(id!),
    select: (response) => response.data ?? null,
    enabled: !!id,
  });
};

export const useMyTeamMembers = (id: string | undefined) => {
  return useQuery<ApiResponse<MyTeamMemberResponseDto[]>, ApiResponse<MyTeamMemberResponseDto[]>, MyTeamMemberResponseDto[]>({
    queryKey: [...teamKeys.myMembership(id ?? ""), "members"],
    queryFn: () => teamService.getMyTeamMembers(id!),
    select: (response) => response.data ?? [],
    enabled: !!id,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useUpdateTeamStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => teamService.updateTeamStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamService.deleteTeam(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

/**
 * Membership mutations affect more than the admin/editor-facing team cache: the target Viewer's
 * "My Teams" list/detail, their notifications and personal activity feed, and the Editor's own
 * operational activity feed all need to reflect the change too (see CLAUDE.md task spec §12).
 */
const invalidateMembershipSideEffects = (queryClient: ReturnType<typeof useQueryClient>, teamId: string) => {
  queryClient.invalidateQueries({ queryKey: [TEAMS_KEY, teamId] });
  queryClient.invalidateQueries({ queryKey: teamKeys.mine() });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
  queryClient.invalidateQueries({ queryKey: ["activities"] });
};

export const useAddTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AddTeamMemberRequest) => teamService.addMember(teamId, request),
    onSuccess: () => invalidateMembershipSideEffects(queryClient, teamId),
  });
};

export const useUpdateTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateTeamMemberRequest }) =>
      teamService.updateMember(teamId, userId, request),
    onSuccess: () => invalidateMembershipSideEffects(queryClient, teamId),
  });
};

export const useRemoveTeamMember = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => teamService.removeMember(teamId, userId),
    onSuccess: () => invalidateMembershipSideEffects(queryClient, teamId),
  });
};
