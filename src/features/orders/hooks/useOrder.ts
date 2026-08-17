import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import { fetchWithRetry, handleApiError, type BaseResponse, type PaginationData } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type { OrderItem, OrderSummaryReport, RawOrderSummaryItem } from "@/features/orders/types/order.types.ts";

export const useHistoryCheckoutsInfiniteQuery = (pageSize = 10) => {
    const { errorNotificationClient } = useNotificationContext();
    
    return useInfiniteQuery({
        queryKey: ["historyCheckouts", pageSize],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const url = `${ENDPOINTS.HISTORY_CHECKOUTS}?page=${pageParam}&size=${pageSize}`;
                const res = await fetchWithRetry<BaseResponse<PaginationData<OrderItem[]>>>({
                    url,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return {
                        data: res.data.data.data || [],
                        lastPage: res.data.data.lastPage ?? (res.data.data.data || []).length < pageSize,
                        nextPage: pageParam + 1,
                    };
                }
                return { data: [], lastPage: true, nextPage: null };
            } catch (err) {
                handleApiError(err, "Failed to load order history", errorNotificationClient);
                throw err;
            }
        },
        getNextPageParam: (lastPage) => {
            return lastPage.lastPage ? undefined : lastPage.nextPage;
        }
    });
};

export const useHistoryCheckoutDetailQuery = (id: number) => {
    const { errorNotificationClient } = useNotificationContext();
    
    return useQuery({
        queryKey: ["historyCheckout", id],
        queryFn: async () => {
            try {
                const res = await fetchWithRetry<BaseResponse<OrderItem>>({
                    url: `${ENDPOINTS.HISTORY_CHECKOUTS_DETAIL}?id=${id}`,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return null;
            } catch (err) {
                handleApiError(err, "Failed to load order detail", errorNotificationClient);
                throw err;
            }
        },
        enabled: !!id
    });
};

export const useSetRatingMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationClient, errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async ({ detailId, rating }: { detailId: number; rating: number }) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.SET_RATING_MENU,
                method: "patch",
                body: { id: detailId, rating },
            });
            if (!res?.data?.success) throw new Error("Failed to submit rating");
            return true;
        },
        onSuccess: () => {
            successNotificationClient("Thank you for your rating!");
            queryClient.invalidateQueries({ queryKey: ["historyCheckouts"] });
            queryClient.invalidateQueries({ queryKey: ["historyCheckout"] });
        },
        onError: (err) => {
            handleApiError(err, "Failed to submit rating", errorNotificationClient);
        }
    });
};

// Barista / Admin
export const useOrderQuery = (page: number, pageSize: number, query?: { search?: string; startDate?: string; endDate?: string }) => {
    const { errorNotificationDashboard } = useNotificationContext();

    return useQuery({
        queryKey: ["orders", page, pageSize, query],
        queryFn: async () => {
            try {
                const params = new URLSearchParams();
                params.append("page", page.toString());
                params.append("size", pageSize.toString());

                if (query?.search) {
                    params.append("searchKey", "orderFor");
                    params.append("searchValue", query.search);
                }
                if (query?.startDate) {
                    params.append("startDate", query.startDate);
                }
                if (query?.endDate) {
                    params.append("endDate", query.endDate);
                }

                const url = `${ENDPOINTS.TRANSACTIONS}?${params.toString()}`;
                const res = await fetchWithRetry<BaseResponse<PaginationData<OrderItem[]>>>({
                    url,
                    method: "get",
                });

                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return null;
            } catch (err) {
                handleApiError(err, "Failed to load barista orders", errorNotificationDashboard);
                throw err;
            }
        }
    });
};

export const useOrderDetailQuery = (id: number) => {
    const { errorNotificationDashboard } = useNotificationContext();

    return useQuery({
        queryKey: ["orderDetail", id],
        queryFn: async () => {
            try {
                const res = await fetchWithRetry<BaseResponse<OrderItem>>({
                    url: `${ENDPOINTS.TRANSACTIONS_DETAIL}?id=${id}`,
                    method: "get",
                });
                if (res?.data?.success && res.data.data) {
                    return res.data.data;
                }
                return null;
            } catch (err) {
                handleApiError(err, "Failed to load order details", errorNotificationDashboard);
                throw err;
            }
        },
        enabled: !!id
    });
};

export const useUpdateOrderStatusMutation = () => {
    const queryClient = useQueryClient();
    const { successNotificationDashboard, errorNotificationDashboard } = useNotificationContext();

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: ENDPOINTS.TRANSACTIONS_UPDATE_STATUS,
                method: "patch",
                body: { id },
            });
            if (!res?.data?.success) throw new Error("Failed to update order status");
            return true;
        },
        onSuccess: () => {
            successNotificationDashboard("Order status updated!");
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["orderDetail"] });
            queryClient.invalidateQueries({ queryKey: ["orderSummary"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] }); // If the table uses this key
        },
        onError: (err) => {
            handleApiError(err, "Failed to update order status", errorNotificationDashboard);
        }
    });
};

export const useOrderSummaryQuery = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ["orderSummary", startDate, endDate],
        queryFn: async () => {
            try {
                if (!startDate || !endDate) return null;
                const url = `${ENDPOINTS.TRANSACTIONS_SUMMARY_REPORT}?startDate=${startDate}&endDate=${endDate}`;
                const res = await fetchWithRetry<BaseResponse<RawOrderSummaryItem[]>>({
                    url,
                    method: "get",
                });
                if (res?.data?.success && Array.isArray(res.data.data)) {
                    const rawData = res.data.data;
                    let totalRevenue = 0;
                    let totalOrders = 0;
                    
                    // The backend returns latest date first based on user example, let's sort it chronologically
                    const sortedData = [...rawData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    
                    const dailyData = sortedData.map(item => {
                        totalRevenue += item.total || 0;
                        totalOrders += item.totalOrder || 0;
                        return {
                            date: new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                            revenue: item.total || 0,
                            orders: item.totalOrder || 0,
                        };
                    });
                    
                    return {
                        totalRevenue,
                        totalOrders,
                        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                        dailyData
                    } as OrderSummaryReport;
                }
                return null;
            } catch (err) {
                console.error("Summary report error:", err);
                return null;
            }
        },
        enabled: !!startDate && !!endDate
    });
};
