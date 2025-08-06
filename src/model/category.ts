import type {BaseResponse} from "./index.ts";
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
    category_id: number,
}

export type ResponseGetCategory = BaseResponse<Category[]>