import {z} from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        email: z.string().email("Please enter a valid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
    .object({
        token: z.string().min(1, "Reset token is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;

export interface LoginResponseData {
    accessToken: string;
    fullName: string;
    email: string;
    role: string;
    photo?: string;
}
