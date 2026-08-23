import { fetchWithRetry, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  RoleItem,
  FeatureItem,
  RolePermissionMatrix,
  RoleFeaturePermissionItem,
  UpdateRolePermissionPayload,
  CreateRolePayload,
} from "../types/role.types.ts";

export const normalizeRolePermissions = (raw: any): RolePermissionMatrix => {
  if (!raw) {
    return {
      roleId: 0,
      roleName: "",
      features: [],
    };
  }

  const rawFeatures = raw.features || raw.featurePermissions || [];
  const features: RoleFeaturePermissionItem[] = rawFeatures.map((item: any) => ({
    featureId: item.featureId,
    featureKey: item.featureKey,
    featureName: item.featureName,
    description: item.description,
    permissions: {
      view: Boolean(item.permissions?.view ?? item.canView ?? item.view ?? false),
      create: Boolean(item.permissions?.create ?? item.canCreate ?? item.create ?? false),
      edit: Boolean(item.permissions?.edit ?? item.canEdit ?? item.edit ?? false),
      delete: Boolean(item.permissions?.delete ?? item.canDelete ?? item.delete ?? false),
    },
  }));

  return {
    roleId: raw.roleId,
    roleName: raw.roleName,
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
  const res = await fetchWithRetry<BaseResponse<any>>({
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

  const res = await fetchWithRetry<BaseResponse<any>>({
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
