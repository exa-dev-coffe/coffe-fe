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
    isPublic?: boolean;
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
    isPublic: z.boolean().default(true),
    expiredAt: z.string().min(1, "Expiry date is required"),
}).superRefine((data, ctx) => {
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Persentase diskon tidak boleh lebih dari 100%",
            path: ["discountValue"],
        });
    }
});

export type VoucherFormData = z.infer<typeof VoucherFormSchema>;
