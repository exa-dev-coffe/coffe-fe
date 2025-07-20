import {type BodyRegister, type RegisterResponse, RegisterSchema} from "../model/auth.ts";
import {useState} from "react";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import {ZodError} from "zod";
import {useNavigate} from "react-router";
import useNotificationContext from "./useNotificationContext.ts";
import axios from "axios";
import type {ExtendedAxiosError} from "../model";

const useAuth = () => {
    const [error, setError] = useState<BodyRegister>({
        email: "",
        password: "",
        full_name: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();
    const notification = useNotificationContext()

    const register = async (data: BodyRegister) => {
        try {
            // Reset error state before validation
            setError({
                email: "",
                password: "",
                full_name: "",
                confirmPassword: "",
            });
            validate(data, RegisterSchema);
            const response = await fetchWithRetry<RegisterResponse>({
                url: "api/signup",
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
                    full_name: "",
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
        }
    }

    return {
        register,
        error,
    }
}

export default useAuth;

