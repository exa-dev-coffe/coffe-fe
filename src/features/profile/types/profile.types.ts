import {z} from "zod";

export interface ProfileData {
    fullName: string;
    email: string;
    role: string;
    photo?: string;
}

export const ProfileFormSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;
