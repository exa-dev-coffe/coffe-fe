import type {BaseResponse, PaginationData} from "./index.ts";
import {z} from "zod";

export type Category = {
    id: number,
    name: string,
}

export type CategoryOptions = {
    label: string,
    value: number,
}

export const CategorySchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
})

export type BodyCategory = z.infer<typeof CategorySchema>

export type BodySetCategory = {
    id: number,
    categoryId: number,
}

export type ResponseGetCategoryPagination = BaseResponse<PaginationData<Category[]>>
export type ResponseGetCategoryNoPagination = BaseResponse<Category[]>