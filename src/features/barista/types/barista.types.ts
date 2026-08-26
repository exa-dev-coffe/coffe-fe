import {z} from "zod";

export interface BaristaItem {
    user_id: number;
    full_name: string;
    email: string;
    photo?: string | null;
}

export const BaristaRegisterSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type BaristaRegisterFormData = z.infer<typeof BaristaRegisterSchema>;
