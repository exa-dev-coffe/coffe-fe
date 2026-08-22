import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithRetry, handleApiError, type BaseResponse } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";

export const useCheckoutMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (payload: {
            pin: string;
            orderFor: string;
            tableId: number;
            voucherCode?: string;
            datas: { menuId: number; qty: number; notes: string }[];
        }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.CHECKOUT,
                method: "post",
                body: payload,
            });

            if (!res?.data?.success) {
                throw new Error("Checkout failed");
            }
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Order placed successfully! Baristas are brewing your coffee.");
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] }); // Update wallet balance
            queryClient.invalidateQueries({ queryKey: ["historyCheckoutsInfinite"] }); // Update transaction history
            queryClient.invalidateQueries({ queryKey: ["orders"] }); // Update order history
        },
        onError: (err) => {
            handleApiError(err, "Payment failed. Please verify your PIN or wallet balance.", errorNotificationClient);
        }
    });
};

export const useValidateVoucherMutation = () => {
    const { errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async (payload: {
            code: string;
            orderTotal: number;
        }) => {
            const res = await fetchWithRetry<BaseResponse<{
                valid: boolean;
                discountAmount: number;
                finalTotal: number;
                message: string;
                discountType?: "PERCENTAGE" | "FIXED";
                discountValue?: number;
                maxDiscount?: number;
                minPurchase?: number;
            }>>({
                url: ENDPOINTS.VOUCHERS_VALIDATE,
                method: "post",
                body: payload,
            });

            if (!res?.data?.success) {
                throw new Error(res?.data?.message || "Failed to validate voucher");
            }
            return res.data.data;
        },
        onError: (err) => {
            handleApiError(err, "Voucher validation failed.", errorNotificationClient);
        }
    });
};
