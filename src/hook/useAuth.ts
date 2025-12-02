import {
    type AuthResponse,
    type BodyLogin,
    type BodyRegister,
    ChangePasswordSchema,
    RegisterSchema
} from "../model/auth.ts";
import {useRef, useState} from "react";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import {ZodError} from "zod";
import {useNavigate} from "react-router";
import useNotificationContext from "./useNotificationContext.ts";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError} from "../model";
import useProfile from "./useProfile.ts";
import useAuthContext from "./useAuthContext.ts";
import useCartContext from "./useCartContext.ts";
import cookie from "../utils/cookie.ts";
import {baseApi} from "../utils/axios.ts";

const useAuth = () => {
    const [error, setError] = useState<BodyRegister>({
        email: "",
        password: "",
        fullName: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();
    const notification = useNotificationContext()
    const {getProfile} = useProfile();
    const loading = useRef(false);
    const auth = useAuthContext()
    const cart = useCartContext()

    const register = async (data: BodyRegister) => {
        if (loading.current) return; // Prevent multiple submissions
        loading.current = true; // Set loading state to true
        try {
            // Reset error state before validation
            setError({
                email: "",
                password: "",
                fullName: "",
                confirmPassword: "",
            });
            validate(data, RegisterSchema);
            const response = await fetchWithRetry<AuthResponse>({
                url: "/api/1.0/auth/register",
                method: "post",
                body: data,
                config: {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            })
            if (response && response.data.success) {
                notification.successNotificationClient(response.data.message, "md",)
                navigate("/login")
            } else {
                notification.errorNotificationClient(response?.data.message || "Registration failed", "md",)
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    email: "",
                    password: "",
                    fullName: "",
                    confirmPassword: "",
                }

                const dataMapError = formatErrorZod<BodyRegister>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                throw error;
            } else if (axios.isAxiosError(error)) {
                if ((error as ExtendedAxiosError).response && (error as ExtendedAxiosError).response?.data.message.includes("data already exists")) {
                    notification.errorNotificationClient("Email already exists", "md",);
                } else {
                    const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                    notification.errorNotificationClient(responseError.message, "md",);
                }
            } else {
                notification.errorNotificationClient("An unexpected error occurred", "md",);
            }
        } finally {
            loading.current = false; // Reset loading state
        }
    }

    const login = async (data: BodyLogin) => {
        if (loading.current) return; // Prevent multiple submissions
        loading.current = true; // Set loading state to true
        try {
            // Reset error state before validation
            setError({
                email: "",
                password: "",
                fullName: "",
                confirmPassword: "",
            });
            const response = await fetchWithRetry<AuthResponse>({
                url: "/api/1.0/auth/login",
                method: "post",
                body: data,
                config: {
                    withCredentials: true,
                },
            })
            if (response && response.data.success) {
                cookie.set(
                    "token",
                    response.data.data.accessToken, 1
                )
                const profile = await getProfile();
                if (!profile) {
                    notification.errorNotificationClient("Failed to fetch profile after login", "md",);
                    return;
                }
                auth.setAuthData({
                    role: profile.role,
                    name: profile.fullName,
                    email: profile.email,
                    photo: profile.photo || '',
                })

                cart.setOrderFor(profile.fullName)

                if (["admin", "barista"].includes(profile.role)) {
                    navigate("/dashboard");
                } else {
                    navigate("/");
                }
            } else {
                notification.errorNotificationClient(response?.data.message || "Login failed", "md",)
            }
        } catch (error) {
            console.error("Login error:", error);
            if (axios.isAxiosError(error)) {
                const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                notification.errorNotificationClient(responseError.message, "md",);
            } else {
                notification.errorNotificationClient("An unexpected error occurred", "md",);
            }
        } finally {
            loading.current = false; // Reset loading state
        }
    }

    const forgetPassword = async (data: { email: string }) => {
        if (loading.current) return; // Prevent multiple submissions
        loading.current = true; // Set loading state to true
        try {
            const response = await fetchWithRetry<BaseResponse<null>>({
                url: "/api/1.0/auth/forgot-password",
                method: "post",
                body: data,
            })

            if (response && response.data.success) {
                notification.successNotificationClient(response.data.message, "md",)
                navigate("/login", {
                    replace: true,
                })
            } else {
                notification.errorNotificationClient(response?.data.message || "Request failed", "md",)
            }
        } catch (error) {
            console.error("Request error:", error);
            if (axios.isAxiosError(error)) {
                const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                notification.errorNotificationClient(responseError.message, "md",);
            } else {
                notification.errorNotificationClient("An unexpected error occurred", "md",);
            }
        } finally {
            loading.current = false; // Reset loading state
        }
    }

    const changePassword = async (data: { token: string, password: string, confirmPassword: string }) => {
        if (loading.current) return; // Prevent multiple submissions
        loading.current = true; // Set loading state to true
        try {
            // Reset error state before validation
            setError({
                email: "",
                password: "",
                fullName: "",
                confirmPassword: "",
            })
            validate(data, ChangePasswordSchema);

            const response = await baseApi.post<BaseResponse<null>>(
                "/api/1.0/auth/change-password",
                data,
            )

            if (response && response.data.success) {
                notification.successNotificationClient(response.data.message, "md",)
                navigate("/login", {
                    replace: true,
                })
            } else {
                notification.errorNotificationClient(response?.data.message || "Request failed", "md",)
            }
        } catch (error) {
            console.error("Request error:", error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    email: "",
                    password: "",
                    fullName: "",
                    confirmPassword: "",
                }

                const dataMapError = formatErrorZod<{ email: string }>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                throw error;
            } else if (axios.isAxiosError(error)) {
                const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                notification.errorNotificationClient(responseError.message, "md",);
            } else {
                notification.errorNotificationClient("An unexpected error occurred", "md",);
            }
        } finally {
            loading.current = false; // Reset loading state
        }
    }

    return {
        register,
        changePassword,
        error,
        forgetPassword,
        login,
    }
}

export default useAuth;

