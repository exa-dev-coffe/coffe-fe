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
  BaristaRegisterSchema,
  type BaristaRegisterFormData,
  type BaristaItem,
} from "@/features/barista/types/barista.types.ts";

export const useBaristaQuery = (
  page: number,
  pageSize: number,
  search?: string,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["baristas", page, pageSize, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", pageSize.toString());
        if (search) {
          params.append("searchKey", "fullName");
          params.append("searchValue", search);
        }

        const url = `${ENDPOINTS.BARISTA_LIST}?${params.toString()}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<BaristaItem[]>>
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
        } as unknown as PaginationData<BaristaItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load baristas",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useAddBaristaMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (formData: BaristaRegisterFormData) => {
      try {
        validate(formData, BaristaRegisterSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<BaristaRegisterFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<null>>({
        url: ENDPOINTS.BARISTA_REGISTER,
        method: "post",
        body: formData,
      });

      if (!res?.data?.success) throw new Error("Failed to register barista");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Barista registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["baristas"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to register barista",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useDeleteBaristaMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.BARISTA_DELETE}?userId=${userId}`,
        method: "delete",
      });
      if (!res?.data?.success) throw new Error("Failed to remove barista");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Barista removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["baristas"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to remove barista",
        errorNotificationDashboard,
      );
    },
  });
};
