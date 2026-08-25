import { fetchWithRetry, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  RoleItem,
  FeatureItem,
  RolePermissionMatrix,
  RoleFeaturePermissionItem,
  UpdateRolePermissionPayload,
  CreateRolePayload,
} from "@/features/roles/types/role.types.ts";

export const normalizeRolePermissions = (
  raw: Record<string, unknown> | null | undefined,
): RolePermissionMatrix => {
  if (!raw) {
    return {
      roleId: 0,
      roleName: "",
      features: [],
    };
  }

  const rawFeatures = (raw.features || raw.featurePermissions || []) as Record<
    string,
    unknown
  >[];
  const features: RoleFeaturePermissionItem[] = rawFeatures.map(
    (item: Record<string, unknown>) => {
      const perms = (item.permissions as Record<string, boolean>) || {};
      return {
        featureId: (item.featureId as number) || 0,
        featureKey: (item.featureKey as string) || "",
        featureName: (item.featureName as string) || "",
        description: (item.description as string) || "",
        permissions: {
          view: Boolean(perms.view ?? item.canView ?? item.view ?? false),
          create: Boolean(
            perms.create ?? item.canCreate ?? item.create ?? false,
          ),
          edit: Boolean(perms.edit ?? item.canEdit ?? item.edit ?? false),
          delete: Boolean(
            perms.delete ?? item.canDelete ?? item.delete ?? false,
          ),
        },
      };
    },
  );

  return {
    roleId: (raw.roleId as number) || 0,
    roleName: (raw.roleName as string) || "",
    features,
  };
};

export const getRoles = async (): Promise<RoleItem[]> => {
  const res = await fetchWithRetry<BaseResponse<RoleItem[]>>({
    url: ENDPOINTS.ADMIN_ROLES,
    method: "get",
  });
  if (!res?.data?.data) {
    throw new Error("Failed to fetch roles");
  }
  return res.data.data;
};

export const getFeatures = async (): Promise<FeatureItem[]> => {
  const res = await fetchWithRetry<BaseResponse<FeatureItem[]>>({
    url: ENDPOINTS.ADMIN_FEATURES,
    method: "get",
  });
  if (!res?.data?.data) {
    throw new Error("Failed to fetch features");
  }
  return res.data.data;
};

export const getRolePermissions = async (
  roleId: number,
): Promise<RolePermissionMatrix> => {
  const res = await fetchWithRetry<BaseResponse<Record<string, unknown>>>({
    url: ENDPOINTS.ADMIN_ROLE_PERMISSIONS(roleId),
    method: "get",
  });
  if (!res?.data?.data) {
    throw new Error("Failed to fetch role permissions");
  }
  return normalizeRolePermissions(res.data.data);
};

export const updateRolePermissions = async (
  roleId: number,
  payload: UpdateRolePermissionPayload,
): Promise<RolePermissionMatrix> => {
  const transformedPayload = {
    permissions: payload.permissions.map((p) => ({
      featureId: p.featureId,
      canView: p.view,
      canCreate: p.create,
      canEdit: p.edit,
      canDelete: p.delete,
      view: p.view,
      create: p.create,
      edit: p.edit,
      delete: p.delete,
    })),
  };

  const res = await fetchWithRetry<BaseResponse<Record<string, unknown>>>({
    url: ENDPOINTS.ADMIN_ROLE_PERMISSIONS(roleId),
    method: "put",
    body: transformedPayload,
  });
  if (!res?.data?.data) {
    throw new Error("Failed to update role permissions");
  }
  return normalizeRolePermissions(res.data.data);
};

export const createRole = async (
  payload: CreateRolePayload,
): Promise<RoleItem> => {
  const res = await fetchWithRetry<BaseResponse<RoleItem>>({
    url: ENDPOINTS.ADMIN_ROLES,
    method: "post",
    body: payload,
  });
  if (!res?.data?.data) {
    throw new Error("Failed to create role");
  }
  return res.data.data;
};
