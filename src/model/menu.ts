import type {BaseResponse, PaginationData} from "./index.ts";
import {z} from "zod";

export type Menu = {
    id: number;
    name: string;
    description: string;
    photo: string;
    isAvailable: boolean;
    categoryId: number;
    categoryName: string;
    price: number;
    rating: number;
};

export type ResponseGetMenuPagination = BaseResponse<PaginationData<Menu[]>>

export type ResponseGetMenuById = BaseResponse<Menu>

export const MenuSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    price: z.number().min(1000, "Price must be at least 1000"),
    isAvailable: z.boolean(),
})

export type BodyMenu = z.infer<typeof MenuSchema> & {
    categoryId?: number;
    id?: number;
    photoBefore?: string;
    photo: string | File;
}

export type ResponseGetMenuByCategory = BaseResponse<Menu[]>
