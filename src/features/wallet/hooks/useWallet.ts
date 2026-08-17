import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { useSnapPayment } from "@/core/hooks/useSnapPayment.ts";
import { fetchWithRetry, handleApiError, type BaseResponse, type PaginationData } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import axios from "axios";
import type { WalletHistoryItem, WalletStatus } from "@/features/wallet/types/wallet.types.ts";

interface TopUpResponse {
    token: string;
    redirect_url?: string;
}

export const useWalletBalanceQuery = () => {
    const { errorNotificationClient } = useNotificationContext();

    return useQuery({
        queryKey: ["walletBalance"],
        queryFn: async () => {
            try {
                const res = await fetchWithRetry<BaseResponse<WalletStatus>>({
                    url: ENDPOINTS.BALANCE,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return { isActive: false, balance: 0 } as WalletStatus;
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    return { isActive: false, balance: 0 } as WalletStatus;
                }
                handleApiError(err, "Failed to load wallet balance", errorNotificationClient);
                throw err;
            }
        }
    });
};

export const useActivateWalletMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (pin: string) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.BALANCE_ACTIVATE,
                method: "post",
                body: { pin },
            });
            if (!res?.data?.success) throw new Error("Failed to activate wallet");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Digital Wallet activated successfully!");
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to activate wallet", errorNotificationClient);
        }
    });
};

export const useWalletHistoryQuery = (page: number, pageSize: number) => {
    const { errorNotificationClient } = useNotificationContext();

    return useQuery({
        queryKey: ["walletHistory", page, pageSize],
        queryFn: async () => {
            try {
                const url = `${ENDPOINTS.BALANCE_HISTORY}?page=${page}&size=${pageSize}&sort=createdAt,desc`;
                const res = await fetchWithRetry<BaseResponse<PaginationData<WalletHistoryItem[]>>>({
                    url,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return { data: [], totalData: 0, totalPages: 0 } as unknown as PaginationData<WalletHistoryItem[]>;
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 404) {
                    return { data: [], totalData: 0, totalPages: 0 } as unknown as PaginationData<WalletHistoryItem[]>;
                }
                handleApiError(err, "Failed to load transaction history", errorNotificationClient);
                throw err;
            }
        }
    });
};

export const useTopUpWalletMutation = () => {
    const queryClient = useQueryClient();
    const { errorNotificationClient } = useNotificationContext();
    const { payWithSnap } = useSnapPayment();

    return useMutation({
        mutationFn: async ({ amount, onCompleted }: { amount: number; onCompleted?: () => void }) => {
            const res = await fetchWithRetry<BaseResponse<TopUpResponse>>({
                url: ENDPOINTS.BALANCE_TOP_UP,
                method: "post",
                body: { amount },
            });

            if (res?.data?.success && res.data.data?.token) {
                const snapToken = res.data.data.token;
                return payWithSnap(snapToken, {
                    onSuccess: () => {
                        if (onCompleted) onCompleted();
                    }
                });
            }
            throw new Error("Failed to initiate top up");
        },
        onSuccess: (success) => {
            // Always invalidate history because a new pending transaction was created
            queryClient.invalidateQueries({ queryKey: ["walletHistory"] });
            if (success) {
                queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
            }
        },
        onError: (err) => {
            handleApiError(err, "Failed to initiate top up", errorNotificationClient);
        }
    });
};
