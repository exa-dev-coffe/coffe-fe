import type {BaseResponse} from "./index.ts";

export type Category = {
    id: number,
    name: string,
}

export type CategoryOptions = {
    label: string,
    value: number,
}

export type ResponseGetCategory = BaseResponse<Category[]>