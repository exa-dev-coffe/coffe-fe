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
  TableFormSchema,
  type TableFormData,
  type TableItem,
} from "@/features/tables/types/table.types.ts";

export const useTableQuery = (
  page: number,
  pageSize: number,
  search?: string,
) => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["tables", page, pageSize, search],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("size", pageSize.toString());
        if (search) {
          params.append("searchKey", "name");
          params.append("searchValue", search);
        }

        const url = `${ENDPOINTS.TABLES}?${params.toString()}`;
        const res = await fetchWithRetry<
          BaseResponse<PaginationData<TableItem[]>>
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
        } as unknown as PaginationData<TableItem[]>;
      } catch (err) {
        handleApiError(
          err,
          "Failed to load tables",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useTableOptionsQuery = () => {
  const { errorNotificationDashboard } = useNotificationContext();

  return useQuery({
    queryKey: ["tableOptions"],
    queryFn: async () => {
      try {
        const url = `${ENDPOINTS.TABLES}?noPaginate=true`;
        const res = await fetchWithRetry<BaseResponse<TableItem[]>>({
          url,
          method: "get",
        });

        if (res?.data?.success && Array.isArray(res.data.data)) {
          return res.data.data.map((t) => ({
            value: Number(t.id),
            label: t.name,
          }));
        }
        return [];
      } catch (err) {
        handleApiError(
          err,
          "Failed to load tables",
          errorNotificationDashboard,
        );
        throw err;
      }
    },
  });
};

export const useAddTableMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (formData: TableFormData) => {
      try {
        validate(formData, TableFormSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<TableFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<TableItem>>({
        url: ENDPOINTS.TABLES,
        method: "post",
        body: formData,
      });

      if (!res?.data?.success) throw new Error("Failed to create table");
      return res.data.data;
    },
    onSuccess: () => {
      successNotificationDashboard("Table created successfully!");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["tableOptions"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to create table",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (tableData: { id: number; name: string }) => {
      try {
        validate({ name: tableData.name }, TableFormSchema);
      } catch (err) {
        if (err instanceof ZodError) {
          throw formatErrorZod<TableFormData>(err);
        }
        throw err;
      }

      const res = await fetchWithRetry<BaseResponse<TableItem>>({
        url: ENDPOINTS.TABLES,
        method: "put",
        body: tableData,
      });

      if (!res?.data?.success) throw new Error("Failed to update table");
      return res.data.data;
    },
    onSuccess: () => {
      successNotificationDashboard("Table updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["tableOptions"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        handleApiError(
          err,
          "Failed to update table",
          errorNotificationDashboard,
        );
      }
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  const { successNotificationDashboard, errorNotificationDashboard } =
    useNotificationContext();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetchWithRetry<BaseResponse<null>>({
        url: `${ENDPOINTS.TABLES}?id=${id}`,
        method: "delete",
      });
      if (!res?.data?.success) throw new Error("Failed to delete table");
      return true;
    },
    onSuccess: () => {
      successNotificationDashboard("Table deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["tableOptions"] });
    },
    onError: (err) => {
      handleApiError(err, "Failed to delete table", errorNotificationDashboard);
    },
  });
};
