import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import Cookie from "@/core/utils/cookie.ts";
import env from "@/core/config/env.ts";

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationData<T> {
  data: T;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalData: number;
  lastPage: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export const apiClient = axios.create({
  baseURL: env.API_URL,
});

export const baseApi = axios.create({
  baseURL: env.API_URL,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookie.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export let refreshPromise: Promise<
  AxiosResponse<BaseResponse<RefreshTokenResponse>>
> | null = null;

export const setRefreshPromise = (
  promise: Promise<AxiosResponse<BaseResponse<RefreshTokenResponse>>> | null,
) => {
  refreshPromise = promise;
};

// Response interceptor to auto-refresh token on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      // Do not retry or refresh on 403 Forbidden
      if (error.response?.status === 403) {
        return Promise.reject(error);
      }

      if (error.config && error.response && error.response.status === 401) {
        // Avoid refresh loops on the refresh endpoint itself
        if (
          error.config.url?.includes("/auth/refresh") ||
          error.config.url?.includes("/auth/login")
        ) {
          Cookie.erase("token");
          return Promise.reject(error);
        }

        if (!refreshPromise) {
          refreshPromise = apiClient.post<BaseResponse<RefreshTokenResponse>>(
            "/api/1.0/auth/refresh",
            {},
            { withCredentials: true },
          );
        }

        try {
          const res = await refreshPromise;
          refreshPromise = null;
          if (res.data?.success && res.data.data?.accessToken) {
            Cookie.set("token", res.data.data.accessToken, 7);
            if (error.config.headers) {
              error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
            }
            return apiClient.request(error.config);
          } else {
            Cookie.erase("token");
            window.location.href = "/login";
          }
        } catch {
          refreshPromise = null;
          Cookie.erase("token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// Generic fetchWithRetry helper
export const fetchWithRetry = async <TR>({
  url,
  method,
  body,
  config,
}: {
  url: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  body?: object | FormData;
  config?: AxiosRequestConfig;
}): Promise<AxiosResponse<TR> | undefined> => {
  let retries = 3;
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (retries) {
    try {
      switch (method) {
        case "get":
          return await apiClient.get<TR>(url, config);
        case "post":
          return await apiClient.post<TR>(url, body, config);
        case "patch":
          return await apiClient.patch<TR>(url, body, config);
        case "put":
          return await apiClient.put<TR>(url, body, config);
        case "delete":
          return await apiClient.delete<TR>(url, config);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }
      }
      if (retries === 1) throw error;
      retries -= 1;
      await delay(800);
    }
  }
};

export const handleApiError = (
  error: unknown,
  defaultMessage: string,
  notify: (message: string) => void,
) => {
  if (axios.isAxiosError(error)) {
    if (error.response && error.response.data) {
      const errData = (error as { response?: { data?: { message?: string } } })
        .response?.data;
      notify(errData?.message || defaultMessage);
      return;
    }
    notify("Network connection error. Please try again.");
  } else {
    notify(`${defaultMessage}. Please try again later.`);
  }
};

export default apiClient;
