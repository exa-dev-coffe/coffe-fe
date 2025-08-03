import type {BaseResponse} from "./index.ts";
import {z} from "zod";

export type Menu = {
    id: number;
    name: string;
    description: string;
    photo: string;
    is_available: boolean;
    category_id: number;
    price: number;
    rating: number;
};

export type ResponseGetMenu = BaseResponse<Menu[]>

export const AddMenuSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().min(1000, "Price must be at least 1000"),
    is_available: z.boolean(),
})

export type BodyAddMenu = z.infer<typeof AddMenuSchema> & {
    category_id?: number;
    photo: string | File;
}