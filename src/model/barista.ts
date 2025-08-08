import type {BaseResponse} from "./index.ts";
import {z} from "zod";

export type Barista = {
    user_id: string
    username: string
    email: string
    full_name: string
    photo: string
};

export type ResponseGetBarista = BaseResponse<Barista[]>

export const BaristaSchema = z.object({
    email: z.email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

export type BodyBarista = z.infer<typeof BaristaSchema>;