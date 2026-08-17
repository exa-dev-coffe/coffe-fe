import {z} from "zod";

export interface TableItem {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export const TableFormSchema = z.object({
    name: z.string().min(1, "Table name or number is required"),
});

export type TableFormData = z.infer<typeof TableFormSchema>;
