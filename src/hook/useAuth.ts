import {type AuthResponse, type BodyLogin, type BodyRegister, RegisterSchema} from "../model/auth.ts";
import {useRef, useState} from "react";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import {ZodError} from "zod";
import {useNavigate} from "react-router";
import useNotificationContext from "./useNotificationContext.ts";
import axios from "axios";
import type {ExtendedAxiosError} from "../model";
import useProfile from "./useProfile.ts";
import useAuthContext from "./useAuthContext.ts";
import useCartContext from "./useCartContext.ts";
import cookie from "../utils/cookie.ts";

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
                notification.setNotification({
                    type: "success",
                    message: response.data.message,
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                })
                navigate("/login")
            } else {
                notification.setNotification({
                    type: "error",
                    message: response?.data.message || "Registration failed",
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                })
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
                    notification.setNotification({
                        type: "error",
                        message: "Email already exists",
                        size: "md",
                        duration: 3000,
                        mode: "client",
                        isShow: true,
                    });
                } else {
                    const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                    notification.setNotification({
                        type: "error",
                        message: responseError.message,
                        size: "md",
                        duration: 3000,
                        mode: "client",
                        isShow: true,
                    });
                }
            } else {
                notification.setNotification({
                    type: "error",
                    message: "An unexpected error occurred",
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                });
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
                    notification.setNotification({
                        type: "error",
                        message: "Failed to fetch profile after login",
                        size: "md",
                        duration: 3000,
                        mode: "client",
                        isShow: true,
                    });
                    return;
                }
                auth.setAuth({
                    role: profile.role,
                    name: profile.fullName,
                    email: profile.email,
                    photo: profile.photo || '',
                    loading: false,
                    isAuth: true,
                })

                cart.setCart({
                    ...cart.cart,
                    orderFor: profile.fullName,
                })

                if (profile.role === "admin") {
                    navigate("/dashboard");
                } else if (profile.role === "barista") {
                    navigate("/dashboard-barista");
                } else {
                    navigate("/");
                }
            } else {
                notification.setNotification({
                    type: "error",
                    message: response?.data.message || "Login failed",
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                })
            }
        } catch (error) {
            console.error("Login error:", error);
            if (axios.isAxiosError(error)) {
                const responseError = (error as ExtendedAxiosError).response?.data || {message: "An error occurred"};
                notification.setNotification({
                    type: "error",
                    message: responseError.message,
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                });
            } else {
                notification.setNotification({
                    type: "error",
                    message: "An unexpected error occurred",
                    size: "md",
                    duration: 3000,
                    mode: "client",
                    isShow: true,
                });
            }
        } finally {
            loading.current = false; // Reset loading state
        }
    }

    return {
        register,
        error,
        login,
    }
}

export default useAuth;

