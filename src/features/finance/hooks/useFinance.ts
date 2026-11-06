import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import {
  fetchWithRetry,
  handleApiError,
  type BaseResponse,
} from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  Supplier,
  SupplierFormData,
  PurchaseOrder,
  CreatePurchasePayload,
  Expense,
  CreateExpensePayload,
  ExpenseCategorySummary,
  ExpenseSummaryResponse,
  FinancialSummary,
  MonthlyExpense,
} from "../types/finance.types.ts";

export const useSuppliersQuery = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "suppliers"],
    queryFn: async () => {
      try {
        const res = await fetchWithRetry<BaseResponse<Supplier[]>>({
          url: ENDPOINTS.FINANCE_SUPPLIERS,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return Array.isArray(res.data.data) ? res.data.data : [];
        }
        return [] as Supplier[];
      } catch (err) {
        handleApiError(err, "Failed to load suppliers", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useCreateSupplierMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (data: SupplierFormData) => {
      const res = await fetchWithRetry<BaseResponse<Supplier>>({
        url: ENDPOINTS.FINANCE_SUPPLIERS,
        method: "post",
        body: data,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "suppliers"] });
      successNotificationDashboard("Supplier added successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to create supplier", errorNotificationDashboard);
    },
  });
};

export const useUpdateSupplierMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SupplierFormData> }) => {
      const res = await fetchWithRetry<BaseResponse<Supplier>>({
        url: ENDPOINTS.FINANCE_SUPPLIER_DETAIL(id),
        method: "put",
        body: data,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "suppliers"] });
      successNotificationDashboard("Supplier updated successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to update supplier", errorNotificationDashboard);
    },
  });
};

export const useDeleteSupplierMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.FINANCE_SUPPLIER_DETAIL(id),
        method: "delete",
      });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "suppliers"] });
      successNotificationDashboard("Supplier deleted successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to delete supplier", errorNotificationDashboard);
    },
  });
};

export const usePurchasesQuery = (supplierId?: string, status?: string) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "purchases", supplierId, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (supplierId) params.append("supplier_id", supplierId);
        if (status) params.append("status", status);
        const url = `${ENDPOINTS.FINANCE_PURCHASES}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<PurchaseOrder[]>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return Array.isArray(res.data.data) ? res.data.data : [];
        }
        return [] as PurchaseOrder[];
      } catch (err) {
        handleApiError(err, "Failed to load purchase orders", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const usePurchaseDetailQuery = (id?: string | null) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "purchaseDetail", id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await fetchWithRetry<BaseResponse<PurchaseOrder>>({
          url: ENDPOINTS.FINANCE_PURCHASE_DETAIL(id),
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
      } catch (err) {
        handleApiError(err, "Failed to load purchase detail", errorNotificationDashboard);
        throw err;
      }
    },
    enabled: !!id,
  });
};

export const useCreatePurchaseMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: CreatePurchasePayload) => {
      const res = await fetchWithRetry<BaseResponse<PurchaseOrder>>({
        url: ENDPOINTS.FINANCE_PURCHASES,
        method: "post",
        body: payload,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "purchases"] });
      successNotificationDashboard("Purchase Order created successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to create purchase order", errorNotificationDashboard);
    },
  });
};

export const useReceivePurchaseMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (
      payload: string | { id: string; items?: { ingredient_id: string; quantity: number }[] }
    ) => {
      const id = typeof payload === "string" ? payload : payload.id;
      const body = typeof payload === "object" && payload.items ? { items: payload.items } : undefined;
      const res = await fetchWithRetry<BaseResponse<PurchaseOrder>>({
        url: ENDPOINTS.FINANCE_PURCHASE_RECEIVE(id),
        method: "post",
        body,
      });
      return res?.data?.data;
    },
    onSuccess: (_, vars) => {
      const id = typeof vars === "string" ? vars : vars.id;
      queryClient.invalidateQueries({ queryKey: ["finance", "purchases"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "purchaseDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "stockLogs"] });
      successNotificationDashboard("Purchase received & inventory stock replenished!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to receive purchase items", errorNotificationDashboard);
    },
  });
};

export const usePayPurchaseMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithRetry<BaseResponse<PurchaseOrder>>({
        url: ENDPOINTS.FINANCE_PURCHASE_PAY(id),
        method: "post",
      });
      return res?.data?.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["finance", "purchases"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "purchaseDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["finance", "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "financialSummary"] });
      successNotificationDashboard("Purchase marked PAID and RAW_MATERIAL expense recorded!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to mark purchase paid", errorNotificationDashboard);
    },
  });
};

export const useExpensesQuery = (category?: string, from?: string, to?: string) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "expenses", category, from, to],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const url = `${ENDPOINTS.FINANCE_EXPENSES}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<Expense[]>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return Array.isArray(res.data.data) ? res.data.data : [];
        }
        return [] as Expense[];
      } catch (err) {
        handleApiError(err, "Failed to load expenses", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useExpensesSummaryQuery = (from?: string, to?: string) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "expensesSummary", from, to],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const url = `${ENDPOINTS.FINANCE_EXPENSES_SUMMARY}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<ExpenseSummaryResponse | ExpenseCategorySummary[]>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          const raw = res.data.data;
          if (Array.isArray(raw)) {
            return raw;
          }
          if (raw && typeof raw === "object" && Array.isArray((raw as ExpenseSummaryResponse).categories)) {
            return (raw as ExpenseSummaryResponse).categories;
          }
        }
        return [] as ExpenseCategorySummary[];
      } catch (err) {
        handleApiError(err, "Failed to load expense summary", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const res = await fetchWithRetry<BaseResponse<Expense>>({
        url: ENDPOINTS.FINANCE_EXPENSES,
        method: "post",
        body: payload,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "expensesSummary"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "financialSummary"] });
      successNotificationDashboard("Expense recorded successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to record expense", errorNotificationDashboard);
    },
  });
};

export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.FINANCE_EXPENSE_DETAIL(id),
        method: "delete",
      });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance", "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "expensesSummary"] });
      queryClient.invalidateQueries({ queryKey: ["finance", "financialSummary"] });
      successNotificationDashboard("Expense deleted successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to delete expense", errorNotificationDashboard);
    },
  });
};

export const useFinancialSummaryQuery = (from?: string, to?: string) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "financialSummary", from, to],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const url = `${ENDPOINTS.FINANCE_REPORT_SUMMARY}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<FinancialSummary>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
      } catch (err) {
        handleApiError(err, "Failed to load financial summary", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useMonthlyExpensesQuery = (year?: number) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["finance", "monthlyExpenses", year],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (year) params.append("year", year.toString());
        const url = `${ENDPOINTS.FINANCE_REPORT_MONTHLY_EXPENSES}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<MonthlyExpense[]>>({
          url,
          method: "get",
        });
        if (res?.data?.success && res.data.data) {
          return Array.isArray(res.data.data) ? res.data.data : [];
        }
        return [] as MonthlyExpense[];
      } catch (err) {
        handleApiError(err, "Failed to load monthly expenses", errorNotificationDashboard);
        throw err;
      }
    },
  });
};
