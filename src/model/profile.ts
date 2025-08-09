import type {BaseResponse} from "./index.ts";

export type GetProfileResponse = BaseResponse<{
    full_name: string;
    email: string;
    role: string;
    photo: string | null;
}>

export type UpdateProfile = {
    full_name: string;
    photo: File | string | null;
}