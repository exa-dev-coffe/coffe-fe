import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { handleApiError } from "@/core/api/client.ts";
import {
  getUsers,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} from "../api/userApi.ts";
import { getRoles } from "@/features/roles/api/roleApi.ts";
import type {
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  AdminResetPasswordPayload,
} from "../types/user.types.ts";

export const useUsersQuery = (params: UserQueryParams) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: [
      "users",
      params.page,
      params.pageSize,
      params.roleId,
      params.searchValue,
    ],
    queryFn: async () => {
      try {
        return await getUsers(params);
      } catch (err) {
        handleApiError(err, "Failed to load users", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useRolesListQuery = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => {
      try {
        return await getRoles();
      } catch (err) {
        handleApiError(err, "Failed to load roles list", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      return await createUser(payload);
    },
    onSuccess: () => {
      successNotificationDashboard("User account created successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["baristas"] });
    },
    onError: (err: unknown) => {
      handleApiError(err, "Failed to create user", errorNotificationDashboard);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: number;
      payload: UpdateUserPayload;
    }) => {
      return await updateUser(userId, payload);
    },
    onSuccess: () => {
      successNotificationDashboard("User account updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["baristas"] });
    },
    onError: (err: unknown) => {
      handleApiError(err, "Failed to update user", errorNotificationDashboard);
    },
  });
};

export const useResetPasswordMutation = () => {
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: number;
      payload: AdminResetPasswordPayload;
    }) => {
      return await resetUserPassword(userId, payload);
    },
    onSuccess: () => {
      successNotificationDashboard("User password has been reset successfully!");
    },
    onError: (err: unknown) => {
      handleApiError(
        err,
        "Failed to reset password",
        errorNotificationDashboard,
      );
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (userId: number) => {
      return await deleteUser(userId);
    },
    onSuccess: () => {
      successNotificationDashboard("User account deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["baristas"] });
    },
    onError: (err: unknown) => {
      handleApiError(err, "Failed to delete user", errorNotificationDashboard);
    },
  });
};
