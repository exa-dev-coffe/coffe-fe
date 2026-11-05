import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import {
  fetchWithRetry,
  handleApiError,
  inventoryApiClient,
  type BaseResponse,
} from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type {
  Ingredient,
  IngredientFormData,
  RecipeItem,
  RecipePayloadItem,
  StockAdjustmentData,
  StockLogItem,
  OpnameSession,
  CreateOpnamePayload,
  PhysicalCountEntry,
} from "../types/inventory.types.ts";

export const useIngredientsQuery = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["inventory", "ingredients"],
    queryFn: async () => {
      try {
        const res = await fetchWithRetry<BaseResponse<Ingredient[]>>({
          url: ENDPOINTS.INVENTORY_INGREDIENTS,
          method: "get",
          client: inventoryApiClient,
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return [] as Ingredient[];
      } catch (err) {
        handleApiError(
          err,
          "Failed to load raw ingredients",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useCreateIngredientMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (data: IngredientFormData) => {
      const res = await fetchWithRetry<BaseResponse<Ingredient>>({
        url: ENDPOINTS.INVENTORY_INGREDIENTS,
        method: "post",
        body: data,
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      successNotificationDashboard("Raw material ingredient created successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to create ingredient", errorNotificationDashboard);
    },
  });
};

export const useUpdateIngredientMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<IngredientFormData> }) => {
      const res = await fetchWithRetry<BaseResponse<Ingredient>>({
        url: ENDPOINTS.INVENTORY_INGREDIENT_DETAIL(id),
        method: "put",
        body: data,
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      successNotificationDashboard("Ingredient updated successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to update ingredient", errorNotificationDashboard);
    },
  });
};

export const useDeleteIngredientMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.INVENTORY_INGREDIENT_DETAIL(id),
        method: "delete",
        client: inventoryApiClient,
      });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      successNotificationDashboard("Ingredient removed successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to delete ingredient", errorNotificationDashboard);
    },
  });
};

export const useRecipeQuery = (menuId?: number | null) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["inventory", "recipes", menuId],
    queryFn: async () => {
      if (!menuId) return [] as RecipeItem[];
      try {
        const res = await fetchWithRetry<BaseResponse<RecipeItem[]>>({
          url: ENDPOINTS.INVENTORY_RECIPES(menuId),
          method: "get",
          client: inventoryApiClient,
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return [] as RecipeItem[];
      } catch (err) {
        handleApiError(err, "Failed to load menu recipe", errorNotificationDashboard);
        throw err;
      }
    },
    enabled: !!menuId,
  });
};

export const useSetRecipeMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({
      menuId,
      items,
    }: {
      menuId: number;
      items: RecipePayloadItem[];
    }) => {
      const res = await fetchWithRetry<BaseResponse<RecipeItem[]>>({
        url: ENDPOINTS.INVENTORY_RECIPES(menuId),
        method: "put",
        body: { items },
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "recipes", variables.menuId],
      });
      successNotificationDashboard("Menu BOM recipe saved successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to save recipe", errorNotificationDashboard);
    },
  });
};

export const useStockAdjustmentMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (data: StockAdjustmentData) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.INVENTORY_STOCK_ADJUST,
        method: "post",
        body: data,
        client: inventoryApiClient,
      });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "stockLogs"] });
      successNotificationDashboard("Stock adjusted successfully!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to adjust stock", errorNotificationDashboard);
    },
  });
};

export const useStockLogsQuery = (
  ingredientId?: string,
  changeType?: string,
  limit = 50,
  offset = 0,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["inventory", "stockLogs", ingredientId, changeType, limit, offset],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (ingredientId) params.append("ingredient_id", ingredientId);
        if (changeType) params.append("change_type", changeType);
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());

        const url = `${ENDPOINTS.INVENTORY_STOCK_LOGS}?${params.toString()}`;
        const res = await fetchWithRetry<BaseResponse<StockLogItem[]>>({
          url,
          method: "get",
          client: inventoryApiClient,
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return [] as StockLogItem[];
      } catch (err) {
        handleApiError(err, "Failed to load stock movement logs", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useOpnamesQuery = (status?: string) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["inventory", "opnames", status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        const url = `${ENDPOINTS.INVENTORY_OPNAMES}?${params.toString()}`;

        const res = await fetchWithRetry<BaseResponse<OpnameSession[]>>({
          url,
          method: "get",
          client: inventoryApiClient,
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return [] as OpnameSession[];
      } catch (err) {
        handleApiError(err, "Failed to load opname sessions", errorNotificationDashboard);
        throw err;
      }
    },
  });
};

export const useOpnameDetailQuery = (opnameId?: string | null) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["inventory", "opnameDetail", opnameId],
    queryFn: async () => {
      if (!opnameId) return null;
      try {
        const res = await fetchWithRetry<BaseResponse<OpnameSession>>({
          url: ENDPOINTS.INVENTORY_OPNAME_DETAIL(opnameId),
          method: "get",
          client: inventoryApiClient,
        });
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return null;
      } catch (err) {
        handleApiError(err, "Failed to load opname details", errorNotificationDashboard);
        throw err;
      }
    },
    enabled: !!opnameId,
  });
};

export const useCreateOpnameMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (payload: CreateOpnamePayload) => {
      const res = await fetchWithRetry<BaseResponse<OpnameSession>>({
        url: ENDPOINTS.INVENTORY_OPNAMES,
        method: "post",
        body: payload,
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", "opnames"] });
      successNotificationDashboard("Stock opname session initiated!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to start opname", errorNotificationDashboard);
    },
  });
};

export const useSubmitOpnameCountsMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({
      opnameId,
      items,
    }: {
      opnameId: string;
      items: PhysicalCountEntry[];
    }) => {
      const res = await fetchWithRetry<BaseResponse<OpnameSession>>({
        url: ENDPOINTS.INVENTORY_OPNAME_COUNTS(opnameId),
        method: "put",
        body: { items },
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "opnameDetail", variables.opnameId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "opnames"] });
      successNotificationDashboard("Physical counts updated!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to submit counts", errorNotificationDashboard);
    },
  });
};

export const useApproveOpnameMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (opnameId: string) => {
      const res = await fetchWithRetry<BaseResponse<OpnameSession>>({
        url: ENDPOINTS.INVENTORY_OPNAME_APPROVE(opnameId),
        method: "post",
        client: inventoryApiClient,
      });
      return res?.data?.data;
    },
    onSuccess: (_, opnameId) => {
      queryClient.invalidateQueries({
        queryKey: ["inventory", "opnameDetail", opnameId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", "opnames"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "ingredients"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "stockLogs"] });
      successNotificationDashboard("Stock opname approved & inventory reconciled!");
    },
    onError: (err) => {
      handleApiError(err, "Failed to approve opname", errorNotificationDashboard);
    },
  });
};
