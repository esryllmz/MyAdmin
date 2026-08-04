import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { userService } from "../services/userService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { PagedResult } from "@/core/types/PagedResult";
import type { CreateViewerAccountRequest, ManageableUsersParams, UserResponseDto } from "../types/userTypes";
import type { RoleResponseDto } from "@/features/roles/types/roleTypes";
import type { RootState } from "@/core/store/store";
import { realtimeEventBus } from "@/core/realtime/realtimeEventBus";

const USERS_QUERY_KEY = ["users"];
const MANAGEABLE_USERS_KEY = "manageable-users";

type UsersResponse = ApiResponse<UserResponseDto[]>;

export const useUsers = () => {
  return useQuery<UsersResponse, ApiResponse<null>, UserResponseDto[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: userService.getAllUsers,
    select: (response) => response.data || [],
  });
};

/** Editor workspace — server-scoped to Viewer-role accounts only (see userService.getManageableViewers). */
export const useManageableUsers = (params: ManageableUsersParams = {}) => {
  return useQuery<ApiResponse<PagedResult<UserResponseDto>>, ApiResponse<null>, PagedResult<UserResponseDto>>({
    queryKey: [MANAGEABLE_USERS_KEY, params],
    queryFn: () => userService.getManageableViewers(params),
    select: (response) => response.data ?? { items: [], totalCount: 0, page: 1, pageSize: params.pageSize ?? 20 },
  });
};

/** Single-user lookup (GET /users/{id}) — server enforces Editor can only look up Viewer targets. */
export const useUserById = (id: string | undefined) => {
  return useQuery<ApiResponse<UserResponseDto>, ApiResponse<UserResponseDto>, UserResponseDto | null>({
    queryKey: ["user", id],
    queryFn: () => userService.getUserById(id!),
    select: (response) => response.data ?? null,
    enabled: !!id,
  });
};

export const useCreateViewerAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateViewerAccountRequest) => userService.createViewerAccount(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MANAGEABLE_USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * Not: `onError`'da ayrıca toast.error çağrılmıyor — apiClient.ts zaten her
 * başarısız istekte handleApiError() üzerinden merkezi olarak toast gösteriyor.
 * Burada sadece optimistic cache rollback yapılıyor, çift bildirim üretilmiyor.
 */

const useActorName = () =>
  useSelector((state: RootState) => state.auth.user?.username) ?? "Bilinmeyen Kullanıcı";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const actor = useActorName();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData<UsersResponse>(USERS_QUERY_KEY);

      queryClient.setQueryData<UsersResponse>(USERS_QUERY_KEY, (old) =>
        old ? { ...old, data: (old.data ?? []).filter((user) => user.id !== id) } : old
      );

      return { previousUsers };
    },
    onSuccess: (_data, id, context) => {
      const targetUsername = context?.previousUsers?.data?.find((user) => user.id === id)?.username ?? id;
      realtimeEventBus.publish({
        type: "USER_DELETED",
        title: "Kullanıcı silindi",
        description: `@${targetUsername} kullanıcısını sildi`,
        actor,
        status: "success",
        entityId: id,
      });
    },
    onError: (_err, _id, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  const actor = useActorName();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.updateUserStatus(id, isActive),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData<UsersResponse>(USERS_QUERY_KEY);

      queryClient.setQueryData<UsersResponse>(USERS_QUERY_KEY, (old) =>
        old
          ? {
              ...old,
              data: (old.data ?? []).map((user) =>
                user.id === id ? { ...user, isActive } : user
              ),
            }
          : old
      );

      return { previousUsers };
    },
    onSuccess: (_data, { id, isActive }, context) => {
      const targetUsername = context?.previousUsers?.data?.find((user) => user.id === id)?.username ?? id;
      realtimeEventBus.publish({
        type: "USER_STATUS_CHANGED",
        title: "Hesap durumu değişti",
        description: `@${targetUsername} hesabını ${isActive ? "Aktif" : "Pasif"} yaptı`,
        actor,
        status: "success",
        entityId: id,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [MANAGEABLE_USERS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

export const useSyncUserRole = () => {
  const queryClient = useQueryClient();
  const actor = useActorName();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: RoleResponseDto }) =>
      userService.syncUserRoles(userId, [role.id]),
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY });
      const previousUsers = queryClient.getQueryData<UsersResponse>(USERS_QUERY_KEY);

      queryClient.setQueryData<UsersResponse>(USERS_QUERY_KEY, (old) =>
        old
          ? {
              ...old,
              data: (old.data ?? []).map((user) =>
                user.id === userId ? { ...user, roles: [role] } : user
              ),
            }
          : old
      );

      return { previousUsers };
    },
    onSuccess: (_data, { userId, role }, context) => {
      const targetUsername = context?.previousUsers?.data?.find((user) => user.id === userId)?.username ?? userId;
      realtimeEventBus.publish({
        type: "ROLE_SYNCED",
        title: "Kullanıcı rolü güncellendi",
        description: `@${targetUsername} kullanıcısının rolünü ${role.name} olarak güncelledi`,
        actor,
        status: "success",
        entityId: userId,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
