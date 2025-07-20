import {z} from "zod";
import type {BaseResponse} from "./index.ts";

export const RegisterSchema = z.object({
    email: z.email(),
    full_name: z.string().min(3, "Full name must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 6 characters")
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }
)

export type BodyRegister = z.infer<typeof RegisterSchema>;

export type BodyLogin = {
    email: string;
    password: string;
}

export type RegisterResponse = BaseResponse<null>

export  type LoginResponse = BaseResponse<{
    token: string;
}>