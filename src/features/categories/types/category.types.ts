import {z} from "zod";

export interface CategoryItem {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
    icon?: string;
    productCount?: number;
}

export const CategoryFormSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    icon: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof CategoryFormSchema>;

export interface UncategorizedMenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    photo: string;
    rating?: number;
}
