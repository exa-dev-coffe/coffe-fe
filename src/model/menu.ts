import type {BaseResponse} from "./index.ts";

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