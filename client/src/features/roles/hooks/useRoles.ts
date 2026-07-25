import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { roleService } from "../services/roleService";
import { realtimeEventBus } from "@/core/realtime/realtimeEventBus";
import type { RootState } from "@/core/store/store";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { CreateRoleRequest, PermissionResponseDto, RoleResponseDto } from "../types/roleTypes";

const ROLES_QUERY_KEY = ["roles"];

type RolesResponse = ApiResponse<RoleResponseDto[]>;

const useActorName = () =>
  useSelector((state: RootState) => state.auth.user?.username) ?? "Bilinmeyen Kullanıcı";

export const useRoles = () => {
  return useQuery<RolesResponse, ApiResponse<null>, RoleResponseDto[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: roleService.getAllRoles,
    select: (response) => response.data || [],
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const actor = useActorName();

  return useMutation({
    mutationFn: (request: CreateRoleRequest) => roleService.createRole(request),
    onSuccess: (_data, request) => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      realtimeEventBus.publish({
        type: "ROLE_CREATED",
        title: "Yeni rol oluşturuldu",
        description: `${request.label || request.name} rolünü oluşturdu`,
        actor,
        status: "success",
      });
    },
  });
};

export const useSyncRolePermissions = () => {
  const queryClient = useQueryClient();
  const actor = useActorName();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: PermissionResponseDto[] }) =>
      roleService.syncRolePermissions(roleId, permissions.map((permission) => permission.id)),
    onMutate: async ({ roleId, permissions }) => {
      await queryClient.cancelQueries({ queryKey: ROLES_QUERY_KEY });
      const previousRoles = queryClient.getQueryData<RolesResponse>(ROLES_QUERY_KEY);

      queryClient.setQueryData<RolesResponse>(ROLES_QUERY_KEY, (old) =>
        old
          ? {
              ...old,
              data: (old.data ?? []).map((role) => (role.id === roleId ? { ...role, permissions } : role)),
            }
          : old
      );

      return { previousRoles };
    },
    onSuccess: (_data, { roleId }, context) => {
      const targetRole = context?.previousRoles?.data?.find((role) => role.id === roleId);
      realtimeEventBus.publish({
        type: "ROLE_SYNCED",
        title: "Rol yetkileri senkronize edildi",
        description: `${targetRole?.label || targetRole?.name || roleId} rolünün yetkilerini güncelledi`,
        actor,
        status: "success",
        entityId: roleId,
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRoles) {
        queryClient.setQueryData(ROLES_QUERY_KEY, context.previousRoles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};
