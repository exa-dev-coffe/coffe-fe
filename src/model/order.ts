import type {BaseResponse} from "./index.ts";

export type Order = {
    id: number;
    status: number;
    status_label: string;
    order_for: string;
    order_by: string;
    user_id: number;
    order_table: string;
    table_id: number;
    total_price: number;
    created_at: string;
    details: {
        id: number;
        menu_id: number;
        menu_name: string;
        photo: string;
        qty: number;
        price: number;
        total_price: number;
        notes: string;
        rating: number;
    }[];
};

export type ResponseGetOrder = BaseResponse<Order[]>

export type BodySetStatusOrder = {
    id: number;
    status: number;
}

export type BodyOrder = {
    table_id: number;
    order_for: string;
    pin: number;
    datas: {
        menu_id: number;
        qty: number;
        notes: string;
    }[];
}
