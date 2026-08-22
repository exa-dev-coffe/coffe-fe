import {z} from "zod";

export interface DiscountDetail {
    promotionId: number;
    promotionName: string;
    discountType: string;
    discountValue: number;
    savings: number;
}

export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    effectivePrice?: number;
    discount?: DiscountDetail;
    photo: string;
    rating?: number;
    isAvailable: boolean;
    categoryId?: number;
    categoryName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export const MenuFormSchema = z.object({
    name: z.string().min(2, "Product name must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    price: z.number().min(1000, "Price must be at least Rp 1.000"),
    isAvailable: z.boolean(),
});

export type MenuFormData = z.infer<typeof MenuFormSchema>;
