import type {BaseResponse} from "./index.ts";
import {z} from "zod";

export type Wallet = {
    is_active: boolean;
    balance: number;
};

export type ResponseCheckWallet = BaseResponse<Wallet>

export const PinShcema = z.object({
    pin: z.string().min(6, "PIN  must be at least 6 characters").max(6, "PIN must be exactly 6 characters"),
    confirmPin: z.string().min(6, "Confirm PIN must be at least 6 characters").max(6, "Confirm PIN must be exactly 6 characters"),
}).refine(
    (data) => data.pin === data.confirmPin,
    {
        message: "PIN and Confirm PIN must match",
        path: ["confirmPin"],
    }
)

export  type BodySetPin = z.infer<typeof PinShcema>;

export type ResponseTopUp = BaseResponse<{
    token: string;
    redirect_url: string;
}>

export  type HistoryBalance = {
    id: number;
    user_id: number;
    type: number;
    label: string;
    amount: number;
    status: number;
    label_status: string;
    redirect_url?: string;
    created_at: string;
}

export type ResponseGetHistoryBalance = BaseResponse<HistoryBalance[]>

