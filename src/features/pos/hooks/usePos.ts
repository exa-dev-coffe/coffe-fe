import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWithRetry,
  handleApiError,
  type BaseResponse,
} from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import type {
  CreatePosOrderPayload,
  ChangePosPaymentPayload,
} from "@/features/pos/types/pos.types.ts";
import type { MenuItem } from "@/features/menu/types/menu.types.ts";
import type { CategoryItem } from "@/features/categories/types/category.types.ts";
import type { TableItem } from "@/features/tables/types/table.types.ts";
import type { OrderItem } from "@/features/orders/types/order.types.ts";

export const usePosMenusQuery = () => {
  return useQuery({
    queryKey: ["posMenus"],
    queryFn: async () => {
      const res = await fetchWithRetry<
        BaseResponse<{ data: MenuItem[] } | MenuItem[]>
      >({
        url: `${ENDPOINTS.MENUS}?noPaginate=true`,
        method: "get",
      });

      if (res?.data?.success && res.data.data) {
        if (Array.isArray(res.data.data)) {
          return res.data.data;
        }
        if (Array.isArray((res.data.data as { data?: MenuItem[] }).data)) {
          return (res.data.data as { data: MenuItem[] }).data as MenuItem[];
        }
      }
      return [] as MenuItem[];
    },
    staleTime: 30000,
  });
};

export const usePosCategoriesQuery = () => {
  return useQuery({
    queryKey: ["posCategories"],
    queryFn: async () => {
      const res = await fetchWithRetry<BaseResponse<CategoryItem[]>>({
        url: `${ENDPOINTS.CATEGORIES}?noPaginate=true`,
        method: "get",
      });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [] as CategoryItem[];
    },
    staleTime: 60000,
  });
};

export const usePosTablesQuery = () => {
  return useQuery({
    queryKey: ["posTables"],
    queryFn: async () => {
      const res = await fetchWithRetry<BaseResponse<TableItem[]>>({
        url: `${ENDPOINTS.TABLES}?noPaginate=true`,
        method: "get",
      });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [] as TableItem[];
    },
    staleTime: 60000,
  });
};

export const usePosCheckoutMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: CreatePosOrderPayload) => {
      const res = await fetchWithRetry<BaseResponse<OrderItem>>({
        url: ENDPOINTS.POS_CHECKOUT,
        method: "post",
        body: payload,
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "POS Checkout failed");
      }
      return res.data.data;
    },
    onSuccess: (data) => {
      successNotificationDashboard(
        `Order #${data?.id || ""} placed successfully! Sent to Barista.`,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["summaryReport"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["posTransactionsHistory"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "POS Checkout failed. Please verify order data.",
        errorNotificationDashboard,
      );
    },
  });
};

export const useValidatePosVoucherMutation = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useMutation({
    mutationFn: async (payload: { code: string; orderTotal: number }) => {
      const res = await fetchWithRetry<
        BaseResponse<{
          valid: boolean;
          discountAmount: number;
          finalTotal: number;
          message: string;
          discountType?: "PERCENTAGE" | "FIXED";
          discountValue?: number;
          maxDiscount?: number;
          minPurchase?: number;
        }>
      >({
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
      handleApiError(
        err,
        "Voucher validation failed.",
        errorNotificationDashboard,
      );
    },
  });
};

export interface PosHistoryQueryParams {
  page?: number;
  size?: number;
  search?: string;
  paymentStatus?: string;
}

export interface PosHistoryResponseData {
  totalData: number;
  data: OrderItem[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  lastPage: boolean;
}

export const usePosTransactionsHistoryQuery = (
  params?: PosHistoryQueryParams,
) => {
  return useQuery({
    queryKey: ["posTransactionsHistory", params],
    queryFn: async () => {
      const page = params?.page || 1;
      const size = params?.size || 10;
      let url = `${ENDPOINTS.POS_TRANSACTIONS}?page=${page}&size=${size}`;
      if (params?.search && params.search.trim()) {
        url += `&search=${encodeURIComponent(params.search.trim())}`;
      }
      if (params?.paymentStatus && params.paymentStatus !== "ALL") {
        url += `&paymentStatus=${params.paymentStatus}`;
      }

      const res = await fetchWithRetry<
        BaseResponse<PosHistoryResponseData | OrderItem[]>
      >({
        url,
        method: "get",
      });

      if (res?.data?.success && res.data.data) {
        if (Array.isArray(res.data.data)) {
          const arr = res.data.data;
          return {
            totalData: arr.length,
            data: arr,
            currentPage: 1,
            pageSize: arr.length || 10,
            totalPages: 1,
            lastPage: true,
          } as PosHistoryResponseData;
        }
        return res.data.data as PosHistoryResponseData;
      }
      return {
        totalData: 0,
        data: [] as OrderItem[],
        currentPage: page,
        pageSize: size,
        totalPages: 0,
        lastPage: true,
      } as PosHistoryResponseData;
    },
  });
};

export const useSyncPosQrisStatusMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await fetchWithRetry<BaseResponse<OrderItem>>({
        url: ENDPOINTS.POS_SYNC_MIDTRANS(orderId),
        method: "post",
      });

      if (!res?.data?.success) {
        throw new Error(res?.data?.message || "Failed to sync payment status");
      }
      return res.data.data;
    },
    onSuccess: (data) => {
      successNotificationDashboard(
        `Payment for Order #${data?.id || ""} confirmed successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["summaryReport"] });
      queryClient.invalidateQueries({ queryKey: ["posTransactionsHistory"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to confirm payment status.",
        errorNotificationDashboard,
      );
    },
  });
};

export const useChangePosPaymentMethodMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: ChangePosPaymentPayload) => {
      const res = await fetchWithRetry<BaseResponse<OrderItem>>({
        url: ENDPOINTS.POS_CHANGE_PAYMENT(payload.orderId),
        method: "patch",
        body: {
          paymentMethod: payload.paymentMethod,
          cashAmount: payload.cashAmount,
          cashChange: payload.cashChange,
          walletPaymentCode: payload.walletPaymentCode,
        },
      });

      if (!res?.data?.success) {
        throw new Error(
          res?.data?.message || "Failed to change payment method",
        );
      }
      return res.data.data;
    },
    onSuccess: (data) => {
      successNotificationDashboard(
        `Payment method for Order #${data?.id || ""} updated successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["summaryReport"] });
      queryClient.invalidateQueries({ queryKey: ["posTransactionsHistory"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to update payment method.",
        errorNotificationDashboard,
      );
    },
  });
};
