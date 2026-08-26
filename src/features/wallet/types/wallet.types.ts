import {z} from "zod";

export interface WalletStatus {
    isActive: boolean;
    balance: number;
    walletNumber?: string;
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
    paymentType?: string;
    bank?: string;
    vaNumber?: string;
    billKey?: string;
    billerCode?: string;
    qrUrl?: string;
    qrString?: string;
    deeplinkUrl?: string;
    expiryTime?: string;
    userEmail?: string;
    userName?: string;
}

export interface TopUpPayload {
    amount: number;
    paymentType: string;
    bank?: string;
}

export interface TopUpResponse {
    balanceHistoryId: string;
    amount: number;
    paymentType: string;
    transactionStatus: string;
    transactionId?: string;
    bank?: string;
    vaNumber?: string;
    billKey?: string;
    billerCode?: string;
    qrUrl?: string;
    qrString?: string;
    deeplinkUrl?: string;
    expiryTime?: string;
    redirectUrl?: string;
    token?: string;
    userEmail?: string;
    userName?: string;
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

export const ChangePinSchema = z
    .object({
        oldPin: z.string().length(6, "Old PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
        newPin: z.string().length(6, "New PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
        confirmNewPin: z.string().length(6, "Confirm PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
    })
    .refine((data) => data.newPin === data.confirmNewPin, {
        message: "New PIN codes do not match",
        path: ["confirmNewPin"],
    });

export type ChangePinFormData = z.infer<typeof ChangePinSchema>;

export const ResetPinSchema = z
    .object({
        code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
        newPin: z.string().length(6, "New PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
        confirmNewPin: z.string().length(6, "Confirm PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers"),
    })
    .refine((data) => data.newPin === data.confirmNewPin, {
        message: "New PIN codes do not match",
        path: ["confirmNewPin"],
    });

export type ResetPinFormData = z.infer<typeof ResetPinSchema>;

export interface GeneratePosCodePayload {
    pin: string;
}

export interface GeneratePosCodeResponse {
    paymentCode: string;
    expiresInSeconds: number;
    currentBalance: number;
    userName: string;
    userEmail: string;
}


