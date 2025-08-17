import type {BaseResponse} from "./index.ts";

export type Wallet = {
    is_active: boolean;
    balance: number;
};

export type ResponseCheckWallet = BaseResponse<Wallet>