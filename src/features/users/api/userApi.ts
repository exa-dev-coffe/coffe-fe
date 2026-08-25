import { fetchWithRetry, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  UserItem,
  CreateUserPayload,
  UpdateUserPayload,
  AdminResetPasswordPayload,
  UserQueryParams,
  PaginatedUsersResponse,
} from "@/features/users/types/user.types.ts";

export const getUsers = async (
  params?: UserQueryParams,
): Promise<PaginatedUsersResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", String(params.page));
  if (params?.pageSize) queryParams.set("size", String(params.pageSize));
  if (params?.roleId && params.roleId > 0)
    queryParams.set("roleId", String(params.roleId));
  if (params?.searchValue)
    queryParams.set("searchValue", params.searchValue);
  if (params?.searchKey) queryParams.set("searchKey", params.searchKey);

  const queryString = queryParams.toString();
  const url = `${ENDPOINTS.ADMIN_USERS}${queryString ? `?${queryString}` : ""}`;

  const res = await fetchWithRetry<BaseResponse<PaginatedUsersResponse>>({
    url,
    method: "get",
  });

  if (!res?.data?.data) {
    throw new Error("Failed to fetch users");
  }
  return res.data.data;
};

export const getUserDetail = async (userId: number): Promise<UserItem> => {
  const res = await fetchWithRetry<BaseResponse<UserItem>>({
    url: ENDPOINTS.ADMIN_USER_DETAIL(userId),
    method: "get",
  });
  if (!res?.data?.data) {
    throw new Error("Failed to fetch user details");
  }
  return res.data.data;
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<UserItem> => {
  const res = await fetchWithRetry<BaseResponse<UserItem>>({
    url: ENDPOINTS.ADMIN_USERS,
    method: "post",
    body: payload,
  });
  if (!res?.data?.data) {
    throw new Error("Failed to create user");
  }
  return res.data.data;
};

export const updateUser = async (
  userId: number,
  payload: UpdateUserPayload,
): Promise<UserItem> => {
  const res = await fetchWithRetry<BaseResponse<UserItem>>({
    url: ENDPOINTS.ADMIN_USER_DETAIL(userId),
    method: "put",
    body: payload,
  });
  if (!res?.data?.data) {
    throw new Error("Failed to update user");
  }
  return res.data.data;
};

export const resetUserPassword = async (
  userId: number,
  payload: AdminResetPasswordPayload,
): Promise<string> => {
  const res = await fetchWithRetry<BaseResponse<string>>({
    url: ENDPOINTS.ADMIN_USER_PASSWORD(userId),
    method: "put",
    body: payload,
  });
  return res?.data?.message || "Password updated successfully";
};

export const deleteUser = async (userId: number): Promise<string> => {
  const res = await fetchWithRetry<BaseResponse<string>>({
    url: ENDPOINTS.ADMIN_USER_DETAIL(userId),
    method: "delete",
  });
  return res?.data?.message || "User deleted successfully";
};
