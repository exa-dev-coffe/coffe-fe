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
  CategoryFormSchema,
  type CategoryFormData,
  type CategoryItem,
  type UncategorizedMenuItem,
} from "@/features/categories/types/category.types.ts";

export const useCategoryQuery = (
  page: number,
  pageSize: number,
  search?: string,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["categories", page, pageSize, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", pageSize.toString());
        if (search) {
          params.append("searchKey", "name");
          params.append("searchValue", search);
        }

        const url = `${ENDPOINTS.CATEGORIES}?${params.toString()}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<CategoryItem[]>>
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
        } as unknown as PaginationData<CategoryItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load categories",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useCategoryOptionsQuery = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["categoryOptions"],
    queryFn: async () => {
      try {
        const url = `${ENDPOINTS.CATEGORIES}?noPaginate=true`;
        const res = await fetchWithRetry<BaseResponse<CategoryItem[]>>({
          url,
          method: "get",
        });

        if (res?.data?.success && Array.isArray(res.data.data)) {
          return res.data.data;
        }
        return [];
      } catch (err) {
        handleApiError(
          err,
          "Failed to load categories",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useAddCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (formData: CategoryFormData) => {
      try {
        validate(formData, CategoryFormSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<CategoryFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<CategoryItem>>({
        url: ENDPOINTS.CATEGORIES,
        method: "post",
        body: formData,
      });

      if (!res?.data?.success) throw new Error("Failed to create category");
      return res.data.data;
    },
    onSuccess: () => {
      successNotificationDashboard("Category created successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryOptions"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to create category",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.CATEGORIES}?id=${id}`,
        method: "delete",
      });
      if (!res?.data?.success) throw new Error("Failed to delete category");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Category deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categoryOptions"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to delete category",
        errorNotificationDashboard,
      );
    },
  });
};

export const useUncategorizedMenuQuery = (page: number, pageSize: number) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["uncategorizedMenus", page, pageSize],
    queryFn: async () => {
      try {
        const url = `${ENDPOINTS.MENUS_UNCATEGORIZED}?page=${page}&size=${pageSize}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<UncategorizedMenuItem[]>>
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
        } as unknown as PaginationData<UncategorizedMenuItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load uncategorized menu",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useSetCategoryMenuMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (dataParams: { id: number; categoryId: number }) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.MENUS_SET_CATEGORY,
        method: "patch",
        body: dataParams,
      });
      if (!res?.data?.success) throw new Error("Failed to assign category");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Menu category assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["uncategorizedMenus"] });
      queryClient.invalidateQueries({ queryKey: ["menusByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      queryClient.invalidateQueries({ queryKey: ["menusInfinite"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to assign category",
        errorNotificationDashboard,
      );
    },
  });
};

export const useMenusByCategoryQuery = (categoryId?: number) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["menusByCategory", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      try {
        const res = await fetchWithRetry<BaseResponse<UncategorizedMenuItem[]>>(
          {
            url: `${ENDPOINTS.MENUS_BY_CATEGORY}?id=${categoryId}`,
            method: "get",
          },
        );
        if (res?.data?.success && res.data.data) {
          return res.data.data;
        }
        return [];
      } catch (err) {
        handleApiError(
          err,
          "Failed to load products for this category",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
    enabled: !!categoryId,
  });
};
