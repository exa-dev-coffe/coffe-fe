import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { fetchWithRetry, handleApiError, type BaseResponse, type PaginationData } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import axios from "axios";
import type { WalletHistoryItem, WalletStatus, TopUpPayload, TopUpResponse } from "@/features/wallet/types/wallet.types.ts";

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

export const useWalletHistoryDetailQuery = (id?: string) => {
    const { errorNotificationClient } = useNotificationContext();

    return useQuery({
        queryKey: ["walletHistoryDetail", id],
        queryFn: async () => {
            if (!id) return null;
            try {
                const res = await fetchWithRetry<BaseResponse<WalletHistoryItem>>({
                    url: `${ENDPOINTS.BALANCE_HISTORY}/${id}`,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return null;
            } catch (err) {
                handleApiError(err, "Failed to load payment details", errorNotificationClient);
                throw err;
            }
        },
        enabled: Boolean(id),
    });
};

export const useTopUpWalletMutation = () => {
    const queryClient = useQueryClient();
    const { errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (payload: TopUpPayload): Promise<TopUpResponse> => {
            const res = await fetchWithRetry<BaseResponse<TopUpResponse>>({
                url: ENDPOINTS.BALANCE_TOP_UP,
                method: "post",
                body: payload,
            });

            if (res?.data?.success && res.data.data) {
                return res.data.data;
            }
            throw new Error("Failed to initiate top up");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["walletHistory"] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to initiate top up", errorNotificationClient);
        }
    });
};

export const useSyncTopUpMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: `${ENDPOINTS.BALANCE_TOP_UP}/${id}/sync`,
                method: "post",
            });
            if (!res?.data?.success) throw new Error("Failed to sync transaction status");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Transaction status synced successfully!");
            queryClient.invalidateQueries({ queryKey: ["walletHistoryDetail"] });
            queryClient.invalidateQueries({ queryKey: ["walletHistory"] });
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to sync transaction status", errorNotificationClient);
        }
    });
};

export const useChangePinMutation = () => {
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (payload: { oldPin: string; newPin: string }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.BALANCE_CHANGE_PIN,
                method: "post",
                body: payload,
            });
            if (!res?.data?.success) throw new Error("Failed to change PIN");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Transaction PIN changed successfully!");
        },
        onError: (err) => {
            handleApiError(err, "Failed to change PIN", errorNotificationClient);
        }
    });
};

export const useSendResetPinCodeMutation = () => {
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async () => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.BALANCE_RESET_PIN_SEND_CODE,
                method: "post",
            });
            if (!res?.data?.success) throw new Error("Failed to send verification code");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Verification code sent to your email!");
        },
        onError: (err) => {
            handleApiError(err, "Failed to send verification code", errorNotificationClient);
        }
    });
};

export const useResetPinMutation = () => {
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (payload: { code: string; newPin: string }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.BALANCE_RESET_PIN,
                method: "post",
                body: payload,
            });
            if (!res?.data?.success) throw new Error("Failed to reset PIN");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Transaction PIN reset successfully!");
        },
        onError: (err) => {
            handleApiError(err, "Failed to reset PIN", errorNotificationClient);
        }
    });
};

