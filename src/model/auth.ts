import {z} from "zod";

export const RegisterSchema = z.object({
    email: z.email(),
    full_name: z.string().min(3, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters")
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }
)

export type BodyRegister = z.infer<typeof RegisterSchema>;