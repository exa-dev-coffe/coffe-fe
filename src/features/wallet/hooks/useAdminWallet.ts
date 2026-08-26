import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { fetchWithRetry, handleApiError, type BaseResponse, type PaginationData } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  AdminWalletItem,
  AdminWalletSummary,
  AdminSendResetPinCodePayload,
  AdminResetPinPayload,
} from "@/features/wallet/types/adminWallet.types.ts";
import type { WalletHistoryItem } from "@/features/wallet/types/wallet.types.ts";

export const useAdminWalletsQuery = (page: number, size: number, search?: string) => {
  const { errorNotificationClient } = useNotificationContext();

  return useQuery({
    queryKey: ["adminWallets", page, size, search],
    queryFn: async () => {
      try {
        let url = `${ENDPOINTS.ADMIN_WALLETS}?page=${page}&size=${size}`;
        if (search && search.trim() !== "") {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        const res = await fetchWithRetry<BaseResponse<PaginationData<AdminWalletItem[]>>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return { data: [], totalData: 0, totalPages: 0, currentPage: 1 } as unknown as PaginationData<AdminWalletItem[]>;
      } catch (err) {
        handleApiError(err, "Failed to load customer wallets", errorNotificationClient);
        throw err;
      }
    },
  });
};

export const useAdminWalletSummaryQuery = () => {
  const { errorNotificationClient } = useNotificationContext();

  return useQuery({
    queryKey: ["adminWalletSummary"],
    queryFn: async () => {
      try {
        const res = await fetchWithRetry<BaseResponse<AdminWalletSummary>>({
          url: ENDPOINTS.ADMIN_WALLETS_SUMMARY,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return { totalActiveWallets: 0, totalInactiveWallets: 0, totalOutstandingBalance: 0 } as AdminWalletSummary;
      } catch (err) {
        handleApiError(err, "Failed to load wallet summary", errorNotificationClient);
        throw err;
      }
    },
  });
};

export const useAdminWalletHistoryQuery = (userId?: number, page: number = 1, size: number = 10) => {
  const { errorNotificationClient } = useNotificationContext();

  return useQuery({
    queryKey: ["adminWalletHistory", userId, page, size],
    queryFn: async () => {
      if (!userId) return null;
      try {
        const url = `${ENDPOINTS.ADMIN_WALLET_HISTORY(userId)}?page=${page}&size=${size}&sort=createdAt,desc`;
        const res = await fetchWithRetry<BaseResponse<PaginationData<WalletHistoryItem[]>>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return { data: [], totalData: 0, totalPages: 0 } as unknown as PaginationData<WalletHistoryItem[]>;
      } catch (err) {
        handleApiError(err, "Failed to load customer wallet history", errorNotificationClient);
        throw err;
      }
    },
    enabled: Boolean(userId),
  });
};

export const useAdminSendResetPinCodeMutation = () => {
  const { successNotificationClient, errorNotificationClient } = useNotificationContext();

  return useMutation({
    mutationFn: async (payload: AdminSendResetPinCodePayload) => {
      const res = await fetchWithRetry<BaseResponse<string>>({
        url: ENDPOINTS.ADMIN_WALLET_RESET_PIN_SEND_CODE,
        method: "post",
        body: payload,
      });
      if (!res?.data?.success) throw new Error("Failed to send verification code");
      return res.data.message || "Verification code sent to customer email!";
    },
    onSuccess: (message) => {
      successNotificationClient(message);
    },
    onError: (err) => {
      handleApiError(err, "Failed to send verification code to customer email", errorNotificationClient);
    },
  });
};

export const useAdminResetPinMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationClient, errorNotificationClient } = useNotificationContext();

  return useMutation({
    mutationFn: async (payload: AdminResetPinPayload) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.ADMIN_WALLET_RESET_PIN,
        method: "post",
        body: payload,
      });
      if (!res?.data?.success) throw new Error("Failed to reset PIN");
      return true;
    },
    onSuccess: () => {
      successNotificationClient("Customer transaction PIN reset successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminWallets"] });
    },
    onError: (err) => {
      handleApiError(err, "Failed to reset customer PIN", errorNotificationClient);
    },
  });
};

export const useAdminToggleWalletStatusMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationClient, errorNotificationClient } = useNotificationContext();

  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.ADMIN_WALLET_TOGGLE_STATUS(userId),
        method: "post",
      });
      if (!res?.data?.success) throw new Error("Failed to update wallet status");
      return true;
    },
    onSuccess: () => {
      successNotificationClient("Wallet status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminWallets"] });
      queryClient.invalidateQueries({ queryKey: ["adminWalletSummary"] });
    },
    onError: (err) => {
      handleApiError(err, "Failed to update wallet status", errorNotificationClient);
    },
  });
};
