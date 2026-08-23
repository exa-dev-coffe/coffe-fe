import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRoles,
  getFeatures,
  getRolePermissions,
  updateRolePermissions,
  createRole,
} from "../api/roleApi.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import type {
  UpdateRolePermissionPayload,
  CreateRolePayload,
} from "../types/role.types.ts";

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });
};

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
  });
};

export const useRolePermissions = (roleId: number | null) => {
  return useQuery({
    queryKey: ["rolePermissions", roleId],
    queryFn: () => (roleId ? getRolePermissions(roleId) : null),
    enabled: Boolean(roleId),
  });
};

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: number;
      payload: UpdateRolePermissionPayload;
    }) => updateRolePermissions(roleId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rolePermissions", variables.roleId],
      });
      successNotificationDashboard(
        `Permissions for "${data.roleName}" updated successfully!`,
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update permissions";
      errorNotificationDashboard(msg);
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      successNotificationDashboard(
        `Role "${data.roleName}" created successfully!`,
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create role";
      errorNotificationDashboard(msg);
    },
  });
};
