import {z} from "zod";

export interface WalletStatus {
    isActive: boolean;
    balance: number;
}

export interface WalletHistoryItem {
    id: string;
    amount: number;
    type: "TOPUP" | "PAYMENT" | string;
    description?: string;
    orderId?: number;
    createdAt: string;
    status?: string;
    token?: string;
    redirectUrl?: string;
}

export const ActivatePinSchema = z
    .object({
        pin: z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
        confirmPin: z.string().length(6, "Confirm PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
    })
    .refine((data) => data.pin === data.confirmPin, {
        message: "PIN codes do not match",
        path: ["confirmPin"],
    });

export type ActivatePinFormData = z.infer<typeof ActivatePinSchema>;
