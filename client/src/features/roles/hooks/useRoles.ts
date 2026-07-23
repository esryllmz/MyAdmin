import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService } from "../services/roleService";
import type { ApiResponse } from "@/core/types/ApiResponse";
import type { CreateRoleRequest, PermissionResponseDto, RoleResponseDto } from "../types/roleTypes";

const ROLES_QUERY_KEY = ["roles"];

type RolesResponse = ApiResponse<RoleResponseDto[]>;

export const useRoles = () => {
  return useQuery<RolesResponse, ApiResponse<null>, RoleResponseDto[]>({
    queryKey: ROLES_QUERY_KEY,
    queryFn: roleService.getAllRoles,
    select: (response) => response.data || [],
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoleRequest) => roleService.createRole(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
    },
  });
};

export const useSyncRolePermissions = () => {
  const queryClient = useQueryClient();

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
