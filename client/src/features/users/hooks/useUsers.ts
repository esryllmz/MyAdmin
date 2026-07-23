import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { userService } from "../services/userService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { UserResponseDto } from "../types/userTypes";
import type { RoleResponseDto } from "@/features/roles/types/roleTypes";
import type { RootState } from "@/core/store/store";
import { logActivity } from "@/features/activities/store/activityFeedSlice";

const USERS_QUERY_KEY = ["users"];

type UsersResponse = ApiResponse<UserResponseDto[]>;

export const useUsers = () => {
  return useQuery<UsersResponse, ApiResponse<null>, UserResponseDto[]>({
    queryKey: USERS_QUERY_KEY,
    queryFn: userService.getAllUsers,
    select: (response) => response.data || [],
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
  const dispatch = useDispatch();
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
      dispatch(
        logActivity({
          type: "user-delete",
          actor,
          message: `@${targetUsername} kullanıcısını sildi`,
          isSuccess: true,
        })
      );
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
  const dispatch = useDispatch();
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
      dispatch(
        logActivity({
          type: "status-toggle",
          actor,
          message: `@${targetUsername} hesabını ${isActive ? "Aktif" : "Pasif"} yaptı`,
          isSuccess: true,
        })
      );
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

export const useSyncUserRole = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
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
      dispatch(
        logActivity({
          type: "role-change",
          actor,
          message: `@${targetUsername} kullanıcısının rolünü ${role.name} olarak güncelledi`,
          isSuccess: true,
        })
      );
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
