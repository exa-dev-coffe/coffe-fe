import axios, {type AxiosResponse} from "axios";
import Cookie from "./cookie.ts";
import type {RefreshTokenResponse} from "../model/auth.ts";

const apiClient = axios.create(
    {
        baseURL: import.meta.env.VITE_APP_API_URL,
    }
)

const baseApi = axios.create(
    {
        baseURL: import.meta.env.VITE_APP_API_URL,
    }
)

export {baseApi};

apiClient.interceptors.request.use(
    config => {
        const token = Cookie.get("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
)

export let refreshPromise: Promise<AxiosResponse<RefreshTokenResponse>> | null = null;

export const setRefreshPromise = (promise: Promise<AxiosResponse<RefreshTokenResponse>> | null) => {
    refreshPromise = promise;
}

apiClient.interceptors.response.use(
    response => response,
    async error => {
        if (axios.isAxiosError(error)) {
            if (
                error.config
            ) {

                if (error.response && error.response.status === 401) {
                    if (!refreshPromise) {
                        refreshPromise = apiClient.post<RefreshTokenResponse>("/api/1.0/auth/refresh", {}, {
                            withCredentials: true
                        })
                    }
                    const res = await refreshPromise
                    refreshPromise = null;
                    if (res.data.success) {
                        Cookie.set("token", res.data.data.accessToken, 1);
                        if (error.config.headers) {
                            error.config.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
                        }
                        return apiClient.request(error.config);
                    } else {
                        Cookie.erase("token");
                        window.location.href = "/login";
                    }

                }
            }
        }
        return Promise.reject(error);
    }
)

export default apiClient;