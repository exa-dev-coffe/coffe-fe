import type {BaseResponse, PaginationData} from "./index.ts";
import {z} from "zod";

export type Table = {
    name: string;
    id: number;
    updatedAt: string;
};

export type ResponseGetTablePagination = BaseResponse<PaginationData<Table[]>>
export type ResponseGetTableNoPagination = BaseResponse<Table[]>

export const TableSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
})

export type BodyTable = z.infer<typeof TableSchema>;