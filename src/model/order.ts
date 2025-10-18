import type {BaseResponse, PaginationData} from "./index.ts";

export type Order = {
    id: number;
    orderStatus: number;
    orderFor: string;
    userId: number;
    tableName: string;
    tableId: number;
    totalPrice: number;
    createdAt: string;
    details: {
        id: number;
        menuId: number;
        menuName: string;
        photo: string;
        qty: number;
        price: number;
        totalPrice: number;
        notes: string;
        rating: number;
    }[];
};

export type ResponseGetOrder = BaseResponse<PaginationData<Order[]>>

export type ResponseGetOrderById = BaseResponse<Order>

export type BodySetStatusOrder = {
    id: number;
}

export type BodyOrder = {
    tableId: number;
    orderFor: string;
    pin: string;
    datas: {
        menuId: number;
        qty: number;
        notes: string;
    }[];
}
