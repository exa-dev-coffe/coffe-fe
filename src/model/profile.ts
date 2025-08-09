import type {BaseResponse} from "./index.ts";
import {z} from "zod";

export type GetProfileResponse = BaseResponse<{
    full_name: string;
    email: string;
    role: string;
    photo: string;
}>

export type UpdateProfile = {
    full_name: string;
    photo: File | string | null;
    preview: string;
}

export const ProfileSchema = z.object({
    full_name: z.string().min(3, "Full name must be at least 3 characters"),
})