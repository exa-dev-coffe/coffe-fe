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
    name: z.string().min(3, "Promotion name must be at least 3 characters"),
    targetType: z.enum(["PRODUCT", "CATEGORY", "ALL"]),
    targetId: z.number().optional().nullable(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().min(1, "Discount value must be greater than 0"),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional(),
    startAt: z.string().min(1, "Start date & time is required"),
    endAt: z.string().min(1, "End date & time is required"),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === "PRODUCT" && (!data.targetId || data.targetId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select target product for product promotion",
        path: ["targetId"],
      });
    }

    if (data.targetType === "CATEGORY" && (!data.targetId || data.targetId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select target category for category promotion",
        path: ["targetId"],
      });
    }

    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount percentage cannot be greater than 100%",
        path: ["discountValue"],
      });
    }

    if (data.startAt && data.endAt) {
      const start = new Date(data.startAt).getTime();
      const end = new Date(data.endAt).getTime();
      if (!isNaN(start) && !isNaN(end) && end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be after start date",
          path: ["endAt"],
        });
      }
    }
  });

export type PromotionFormData = z.infer<typeof PromotionFormSchema>;
