import { z } from "zod";

export type TargetType = "PRODUCT" | "CATEGORY" | "ALL";
export type DiscountType = "PERCENTAGE" | "FIXED";

export interface PromotionItem {
  id: number;
  name: string;
  targetType: TargetType;
  targetId?: number | null;
  targetName?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number;
  minPurchase: number;
  startAt: string;
  endAt: string;
  isActive: boolean;
  createdAt: string;
}

export const PromotionFormSchema = z
  .object({
    name: z.string().min(3, "Nama promosi minimal 3 karakter"),
    targetType: z.enum(["PRODUCT", "CATEGORY", "ALL"]),
    targetId: z.number().optional().nullable(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().min(1, "Nilai diskon harus lebih dari 0"),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional(),
    startAt: z.string().min(1, "Tanggal & jam mulai wajib diisi"),
    endAt: z.string().min(1, "Tanggal & jam berakhir wajib diisi"),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "PRODUCT" && (!data.targetId || data.targetId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Silakan pilih produk target untuk promo produk",
        path: ["targetId"],
      });
    }

    if (data.targetType === "CATEGORY" && (!data.targetId || data.targetId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Silakan pilih kategori target untuk promo kategori",
        path: ["targetId"],
      });
    }

    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Persentase diskon tidak boleh lebih dari 100%",
        path: ["discountValue"],
      });
    }

    if (data.startAt && data.endAt) {
      const start = new Date(data.startAt).getTime();
      const end = new Date(data.endAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tanggal berakhir harus setelah tanggal mulai",
          path: ["endAt"],
        });
      }
    }
  });

export type PromotionFormData = z.infer<typeof PromotionFormSchema>;
