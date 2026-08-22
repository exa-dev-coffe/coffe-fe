import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ZodError } from "zod";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";
import {
  fetchWithRetry,
  handleApiError,
  type BaseResponse,
  type PaginationData,
} from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import { formatErrorZod, validate } from "@/core/utils/validation.ts";
import {
  PromotionFormSchema,
  type PromotionFormData,
  type PromotionItem,
} from "@/features/promotions/types/promotion.types.ts";

export const usePromotionQuery = (
  page: number,
  pageSize: number,
  search?: string,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["promotions", page, pageSize, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", pageSize.toString());
        if (search) {
          params.append("searchKey", "name");
          params.append("searchValue", search);
        }

        const url = `${ENDPOINTS.PROMOTIONS}?${params.toString()}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<PromotionItem[]>>
        >({
          url,
          method: "get",
        });

        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return {
          data: [],
          totalData: 0,
          totalPages: 0,
        } as unknown as PaginationData<PromotionItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load promotions",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useCreatePromotionMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (formData: PromotionFormData) => {
      try {
        validate(formData, PromotionFormSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<PromotionFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<{ id: number }>>({
        url: ENDPOINTS.PROMOTIONS,
        method: "post",
        body: formData,
      });

      if (!res?.data?.success) throw new Error("Failed to create promotion");
      return res.data.data;
    },
    onSuccess: () => {
      successNotificationDashboard("Promotion campaign created successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to create promotion",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useDeletePromotionMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.PROMOTIONS}/${id}`,
        method: "delete",
      });
      if (!res?.data?.success) throw new Error("Failed to delete promotion");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Promotion deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to delete promotion",
        errorNotificationDashboard,
      );
    },
  });
};

export const useTogglePromotionStatusMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.PROMOTIONS}/${id}/status`,
        method: "patch",
        body: { isActive },
      });
      if (!res?.data?.success)
        throw new Error("Failed to update promotion status");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Promotion status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to update promotion status",
        errorNotificationDashboard,
      );
    },
  });
};
