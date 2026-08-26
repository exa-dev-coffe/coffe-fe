import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { ZodError } from "zod";
import { jwtDecode } from "jwt-decode";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { baseApi, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import Cookie from "@/core/utils/cookie.ts";
import { formatErrorZod, validate } from "@/core/utils/validation.ts";
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

interface DecodedTokenPayload {
  fullName?: string;
  email?: string;
  role?: string;
  photo?: string;
}

interface GoogleAuthResponse {
  code?: string;
  error?: string;
  [key: string]: unknown;
}

type GooglePopupResponseData =
  | {
      registerRequired: true;
      registrationToken: string;
      email: string;
      fullName: string;
    }
  | {
      registerRequired: false;
      authData: {
        accessToken: string;
        refreshToken: string;
      };
    };

interface GoogleOAuthClientConfig {
  client_id: string;
  scope: string;
  ux_mode: "popup" | "redirect";
  callback: (response: GoogleAuthResponse) => void;
  error_callback?: () => void;
}

interface GoogleOAuthClient {
  requestCode: () => void;
}

interface WindowWithGoogle extends Window {
  google?: {
    accounts?: {
      oauth2?: {
        initCodeClient: (config: GoogleOAuthClientConfig) => GoogleOAuthClient;
      };
    };
  };
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setAuthData, refetchProfile } = useAuthContext();
  const { successNotificationClient, errorNotificationClient } =
    useNotificationContext();
  const navigate = useNavigate();

  const clearErrors = () => setErrors({});

  const processAuthSuccess = useCallback(
    async (accessToken: string, message: string) => {
      Cookie.set("token", accessToken, 7);
      let name = "";
      let email = "";
      let role = "";
      let photo = "";

      try {
        const decoded = jwtDecode<DecodedTokenPayload>(accessToken);
        name = decoded.fullName || "";
        email = decoded.email || "";
        role = decoded.role || "";
        photo = decoded.photo || "";
      } catch (e) {
        console.error("JWT decode error:", e);
      }

      setAuthData({ name, email, role, photo });
      await refetchProfile();
      successNotificationClient(message);

      if (role === "admin" || role === "barista") {
        navigate("/dashboard/menu");
      } else {
        navigate("/");
      }
    },
    [navigate, setAuthData, refetchProfile, successNotificationClient],
  );

  const login = useCallback(
    async (data: LoginFormData) => {
      setLoading(true);
      setErrors({});
      try {
        validate(data, LoginSchema);
        const res = await baseApi.post<BaseResponse<LoginResponseData>>(
          ENDPOINTS.AUTH_LOGIN,
          data,
          { withCredentials: true },
        );

        if (res.data?.success && res.data.data) {
          await processAuthSuccess(
            res.data.data.accessToken,
            "Signed in successfully!",
          );
          return true;
        }
        return false;
      } catch (err) {
        if (err instanceof ZodError) {
          setErrors(formatErrorZod<LoginFormData>(err));
        } else if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message || "Invalid email or password",
          );
        } else {
          errorNotificationClient("Login failed. Please try again.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [processAuthSuccess, errorNotificationClient],
  );

  const register = useCallback(
    async (data: RegisterFormData & { code?: string }) => {
      setLoading(true);
      setErrors({});
      try {
        validate(data, RegisterSchema);
        const res = await baseApi.post<BaseResponse<LoginResponseData>>(
          ENDPOINTS.AUTH_REGISTER,
          data,
        );

        if (res.data?.success && res.data.data) {
          await processAuthSuccess(
            res.data.data.accessToken,
            "Registration successful! You are now signed in.",
          );
          return true;
        }
        return false;
      } catch (err) {
        if (err instanceof ZodError) {
          setErrors(formatErrorZod<RegisterFormData>(err));
        } else if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message ||
              "Registration failed. Email might already exist.",
          );
        } else {
          errorNotificationClient("Registration failed. Please try again.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [processAuthSuccess, errorNotificationClient],
  );

  const sendRegisterCode = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        const res = await baseApi.post<BaseResponse<null>>(
          ENDPOINTS.AUTH_REGISTER_SEND_CODE,
          { email },
        );
        if (res.data?.success) {
          successNotificationClient("Verification code sent to your email!");
          return true;
        }
        return false;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message || "Failed to send verification code.",
          );
        } else {
          errorNotificationClient("An error occurred. Please try again.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [successNotificationClient, errorNotificationClient],
  );

  const googleAuthPopup = useCallback((): Promise<{
    success: boolean;
    registerRequired?: boolean;
    registrationToken?: string;
    email?: string;
    fullName?: string;
  }> => {
    return new Promise((resolve) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        errorNotificationClient("Google Client ID is not set.");
        resolve({ success: false });
        return;
      }

      setLoading(true);
      try {
        const client = (
          window as unknown as WindowWithGoogle
        ).google?.accounts?.oauth2?.initCodeClient({
          client_id: clientId,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: async (response: GoogleAuthResponse) => {
            if (response.code) {
              try {
                const res = await baseApi.post<
                  BaseResponse<GooglePopupResponseData>
                >(
                  ENDPOINTS.AUTH_GOOGLE_POPUP,
                  { code: response.code },
                  { withCredentials: true },
                );

                if (res.data?.success) {
                  const resData = res.data.data;
                  if (resData.registerRequired) {
                    resolve({
                      success: true,
                      registerRequired: true,
                      registrationToken: resData.registrationToken,
                      email: resData.email,
                      fullName: resData.fullName,
                    });
                  } else {
                    await processAuthSuccess(
                      resData.authData.accessToken,
                      "Signed in with Google successfully!",
                    );
                    resolve({ success: true, registerRequired: false });
                  }
                } else {
                  resolve({ success: false });
                }
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  errorNotificationClient(
                    err.response?.data?.message ||
                      "Google authentication failed.",
                  );
                } else {
                  errorNotificationClient("Google authentication failed.");
                }
                resolve({ success: false });
              } finally {
                setLoading(false);
              }
            } else {
              setLoading(false);
              resolve({ success: false });
            }
          },
          error_callback: () => {
            setLoading(false);
            resolve({ success: false });
          },
        });
        client?.requestCode();
      } catch (error) {
        setLoading(false);
        console.error("Error during Google OAuth:", error);
        resolve({ success: false });
      }
    });
  }, [processAuthSuccess, errorNotificationClient]);

  const registerGoogle = useCallback(
    async (registrationToken: string, password: string) => {
      setLoading(true);
      try {
        const res = await baseApi.post<BaseResponse<LoginResponseData>>(
          ENDPOINTS.AUTH_GOOGLE_REGISTER,
          { registrationToken, password },
          { withCredentials: true },
        );

        if (res.data?.success && res.data.data) {
          await processAuthSuccess(
            res.data.data.accessToken,
            "Registered and signed in successfully!",
          );
          return true;
        }
        return false;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message || "Google registration failed.",
          );
        } else {
          errorNotificationClient(
            "Google registration failed. Please try again.",
          );
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [processAuthSuccess, errorNotificationClient],
  );

  const forgotPassword = useCallback(
    async (data: ForgotPasswordFormData) => {
      setLoading(true);
      setErrors({});
      try {
        validate(data, ForgotPasswordSchema);
        const res = await baseApi.post<BaseResponse<null>>(
          ENDPOINTS.AUTH_FORGOT_PASSWORD,
          data,
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
            err.response?.data?.message ||
              "Failed to process forgot password request.",
          );
        } else {
          errorNotificationClient("An error occurred. Please try again.");
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [successNotificationClient, errorNotificationClient],
  );

  const changePassword = useCallback(
    async (data: ResetPasswordFormData) => {
      setLoading(true);
      setErrors({});
      try {
        validate(data, ResetPasswordSchema);
        const res = await baseApi.post<BaseResponse<null>>(
          ENDPOINTS.AUTH_CHANGE_PASSWORD,
          data,
        );

        if (res.data?.success) {
          successNotificationClient(
            "Password reset successfully! You can now sign in.",
          );
          navigate("/login");
          return true;
        }
        return false;
      } catch (err) {
        if (err instanceof ZodError) {
          setErrors(formatErrorZod<ResetPasswordFormData>(err));
        } else if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message ||
              "Password reset token is invalid or expired.",
          );
        } else {
          errorNotificationClient(
            "Failed to reset password. Please try again.",
          );
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, successNotificationClient, errorNotificationClient],
  );

  const googleLogin = useCallback(
    async (tokenTemp: string) => {
      setLoading(true);
      try {
        const res = await baseApi.post<BaseResponse<LoginResponseData>>(
          ENDPOINTS.AUTH_GOOGLE_LOGIN,
          { tokenTemp },
          { withCredentials: true },
        );

        if (res.data?.success && res.data.data) {
          await processAuthSuccess(
            res.data.data.accessToken,
            "Signed in with Google successfully!",
          );
          return true;
        }
        return false;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          errorNotificationClient(
            err.response?.data?.message || "Google sign-in failed.",
          );
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [processAuthSuccess, errorNotificationClient],
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
    sendRegisterCode,
    googleAuthPopup,
    registerGoogle,
    forgotPassword,
    changePassword,
    googleLogin,
    googleLoginRedirect,
  };
};

export default useAuth;
