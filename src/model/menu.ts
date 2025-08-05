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

export const MenuSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().min(1000, "Price must be at least 1000"),
    is_available: z.boolean(),
})

export type BodyMenu = z.infer<typeof MenuSchema> & {
    category_id?: number;
    id?: number
    photo: string | File;
}

export type ResponseGetMenuByCategory = BaseResponse<{
    id: number;
    name: string;
    menus?: Menu[];
}>
