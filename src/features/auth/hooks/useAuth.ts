import {useState, useCallback} from "react";
import {useNavigate} from "react-router";
import {ZodError} from "zod";
import {useAuthContext} from "@/app/providers/AuthContext.ts";
import {useNotificationContext} from "@/app/providers/NotificationContext.ts";
import {baseApi, type BaseResponse} from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import Cookie from "@/core/utils/cookie.ts";
import {formatErrorZod, validate} from "@/core/utils/validation.ts";
import {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    type LoginFormData,
    type RegisterFormData,
    type ForgotPasswordFormData,
    type ResetPasswordFormData,
    type LoginResponseData,
} from "@/features/auth/types/auth.types.ts";
import axios from "axios";

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const {setAuthData} = useAuthContext();
    const {successNotificationClient, errorNotificationClient} = useNotificationContext();
    const navigate = useNavigate();

    const clearErrors = () => setErrors({});

    const login = useCallback(
        async (data: LoginFormData) => {
            setLoading(true);
            setErrors({});
            try {
                validate(data, LoginSchema);
                const res = await baseApi.post<BaseResponse<LoginResponseData>>(
                    ENDPOINTS.AUTH_LOGIN,
                    data,
                    {withCredentials: true}
                );

                if (res.data?.success && res.data.data) {
                    const authData = res.data.data;
                    Cookie.set("token", authData.accessToken, 7);
                    setAuthData({
                        name: authData.fullName,
                        email: authData.email,
                        role: authData.role,
                        photo: authData.photo,
                    });
                    successNotificationClient("Signed in successfully!");

                    if (authData.role === "admin" || authData.role === "barista") {
                        navigate("/dashboard/menu");
                    } else {
                        navigate("/");
                    }
                    return true;
                }
                return false;
            } catch (err) {
                if (err instanceof ZodError) {
                    setErrors(formatErrorZod<LoginFormData>(err));
                } else if (axios.isAxiosError(err)) {
                    errorNotificationClient(
                        err.response?.data?.message || "Invalid email or password"
                    );
                } else {
                    errorNotificationClient("Login failed. Please try again.");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate, setAuthData, successNotificationClient, errorNotificationClient]
    );

    const register = useCallback(
        async (data: RegisterFormData) => {
            setLoading(true);
            setErrors({});
            try {
                validate(data, RegisterSchema);
                const res = await baseApi.post<BaseResponse<{ fullName: string }>>(
                    ENDPOINTS.AUTH_REGISTER,
                    data
                );

                if (res.data?.success) {
                    successNotificationClient("Registration successful! Please sign in.");
                    navigate("/login");
                    return true;
                }
                return false;
            } catch (err) {
                if (err instanceof ZodError) {
                    setErrors(formatErrorZod<RegisterFormData>(err));
                } else if (axios.isAxiosError(err)) {
                    errorNotificationClient(
                        err.response?.data?.message || "Registration failed. Email might already exist."
                    );
                } else {
                    errorNotificationClient("Registration failed. Please try again.");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate, successNotificationClient, errorNotificationClient]
    );

    const forgotPassword = useCallback(
        async (data: ForgotPasswordFormData) => {
            setLoading(true);
            setErrors({});
            try {
                validate(data, ForgotPasswordSchema);
                const res = await baseApi.post<BaseResponse<null>>(
                    ENDPOINTS.AUTH_FORGOT_PASSWORD,
                    data
                );

                if (res.data?.success) {
                    successNotificationClient("Password reset link sent to your email!");
                    return true;
                }
                return false;
            } catch (err) {
                if (err instanceof ZodError) {
                    setErrors(formatErrorZod<ForgotPasswordFormData>(err));
                } else if (axios.isAxiosError(err)) {
                    errorNotificationClient(
                        err.response?.data?.message || "Failed to process forgot password request."
                    );
                } else {
                    errorNotificationClient("An error occurred. Please try again.");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [successNotificationClient, errorNotificationClient]
    );

    const changePassword = useCallback(
        async (data: ResetPasswordFormData) => {
            setLoading(true);
            setErrors({});
            try {
                validate(data, ResetPasswordSchema);
                const res = await baseApi.post<BaseResponse<null>>(
                    ENDPOINTS.AUTH_CHANGE_PASSWORD,
                    data
                );

                if (res.data?.success) {
                    successNotificationClient("Password reset successfully! You can now sign in.");
                    navigate("/login");
                    return true;
                }
                return false;
            } catch (err) {
                if (err instanceof ZodError) {
                    setErrors(formatErrorZod<ResetPasswordFormData>(err));
                } else if (axios.isAxiosError(err)) {
                    errorNotificationClient(
                        err.response?.data?.message || "Password reset token is invalid or expired."
                    );
                } else {
                    errorNotificationClient("Failed to reset password. Please try again.");
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate, successNotificationClient, errorNotificationClient]
    );

    const googleLogin = useCallback(
        async (tokenTemp: string) => {
            setLoading(true);
            try {
                const res = await baseApi.post<BaseResponse<LoginResponseData>>(
                    ENDPOINTS.AUTH_GOOGLE_LOGIN,
                    {tokenTemp},
                    {withCredentials: true}
                );

                if (res.data?.success && res.data.data) {
                    const authData = res.data.data;
                    Cookie.set("token", authData.accessToken, 7);
                    setAuthData({
                        name: authData.fullName,
                        email: authData.email,
                        role: authData.role,
                        photo: authData.photo,
                    });
                    successNotificationClient("Signed in with Google successfully!");

                    if (authData.role === "admin" || authData.role === "barista") {
                        navigate("/dashboard/menu");
                    } else {
                        navigate("/");
                    }
                    return true;
                }
                return false;
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    errorNotificationClient(
                        err.response?.data?.message || "Google sign-in failed."
                    );
                }
                return false;
            } finally {
                setLoading(false);
            }
        },
        [navigate, setAuthData, successNotificationClient, errorNotificationClient]
    );

    const googleLoginRedirect = useCallback(() => {
        window.location.href = `${baseApi.defaults.baseURL}${ENDPOINTS.AUTH_GOOGLE_REDIRECT}`;
    }, []);

    return {
        loading,
        errors,
        clearErrors,
        login,
        register,
        forgotPassword,
        changePassword,
        googleLogin,
        googleLoginRedirect,
    };
};

export default useAuth;
