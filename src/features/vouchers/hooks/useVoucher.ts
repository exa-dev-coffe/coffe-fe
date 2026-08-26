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
  VoucherFormSchema,
  type VoucherFormData,
  type VoucherItem,
} from "@/features/vouchers/types/voucher.types.ts";

export const useVoucherQuery = (
  page: number,
  pageSize: number,
  search?: string,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["vouchers", page, pageSize, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", pageSize.toString());
        if (search) {
          params.append("searchKey", "code");
          params.append("searchValue", search);
        }

        const url = `${ENDPOINTS.VOUCHERS}?${params.toString()}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<VoucherItem[]>>
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
        } as unknown as PaginationData<VoucherItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load vouchers",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useCreateVoucherMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (formData: VoucherFormData) => {
      try {
        validate(formData, VoucherFormSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<VoucherFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<{ id: number }>>({
        url: ENDPOINTS.VOUCHERS,
        method: "post",
        body: formData,
      });

      if (!res?.data?.success) throw new Error("Failed to create voucher");
      return res.data.data;
    },
    onSuccess: () => {
      successNotificationDashboard("Voucher created successfully!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to create voucher",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useDeleteVoucherMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.VOUCHERS}/${id}`,
        method: "delete",
      });
      if (!res?.data?.success) throw new Error("Failed to delete voucher");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Voucher deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to delete voucher",
        errorNotificationDashboard,
      );
    },
  });
};

export const useToggleVoucherStatusMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
      isPublic,
    }: {
      id: number;
      isActive?: boolean;
      isPublic?: boolean;
    }) => {
      const body: Record<string, boolean> = {};
      if (isActive !== undefined) body.isActive = isActive;
      if (isPublic !== undefined) body.isPublic = isPublic;

      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.VOUCHERS}/${id}/status`,
        method: "patch",
        body,
      });
      if (!res?.data?.success)
        throw new Error("Failed to update voucher status");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Voucher status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (err) => {
      handleApiError(
        err,
        "Failed to update voucher status",
        errorNotificationDashboard,
      );
    },
  });
};
