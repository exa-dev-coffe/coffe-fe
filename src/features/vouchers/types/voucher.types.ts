import {z} from "zod";

export interface VoucherItem {
    id: number;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    maxDiscount: number;
    minPurchase: number;
    quota: number;
    isActive: boolean;
    expiredAt: string;
    createdAt?: string;
    updatedAt?: string;
}

export const VoucherFormSchema = z.object({
    code: z.string().min(3, "Voucher code must be at least 3 characters").max(50),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().gt(0, "Discount value must be greater than 0"),
    maxDiscount: z.number().default(0),
    minPurchase: z.number().default(0),
    quota: z.number().default(-1),
    expiredAt: z.string().min(1, "Expiry date is required"),
});

export type VoucherFormData = z.infer<typeof VoucherFormSchema>;
