import { useState } from "react";
import type {
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  fetchWithRetry,
  type BaseResponse,
  type PaginationData,
} from "@/core/api/client.ts";

interface UsePaginationParams {
  url: string;
  filterColumn?: string[];
  advancedFilter?: Record<string, string | number>;
  pageSize?: number;
}

export const usePagination = <TData>({
  url,
  filterColumn = [],
  advancedFilter = {},
  pageSize = 10,
}: UsePaginationParams) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const handlePageChange = (updater: Updater<PaginationState>) => {
    setPagination((old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
  };

  const handleSortingChange = (updater: Updater<SortingState>) => {
    setSorting((old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
    setPagination((old) => ({ ...old, pageIndex: 0 }));
  };

  const handleGlobalFilterChange = (updater: Updater<string>) => {
    setGlobalFilter((old) =>
      typeof updater === "function" ? updater(old) : updater,
    );
    setPagination((old) => ({ ...old, pageIndex: 0 }));
  };

  const fetchData = async () => {
    const params = new URLSearchParams();
    const fieldSort = sorting[0]?.id;
    const directionSort = sorting[0]?.desc ? "desc" : "asc";

    params.append("page", (pagination.pageIndex + 1).toString());
    params.append("size", pagination.pageSize.toString());
    if (fieldSort) params.append("sort", `${fieldSort},${directionSort}`);
    
    if (globalFilter && filterColumn.length > 0) {
      let searchKeys = "";
      let searchValues = "";
      filterColumn.forEach((column) => {
        if (searchKeys) searchKeys += ",";
        if (searchValues) searchValues += ",";
        searchKeys += column;
        searchValues += globalFilter;
      });
      params.append("searchKey", searchKeys);
      params.append("searchValue", searchValues);
    }

    if (advancedFilter) {
      Object.entries(advancedFilter).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const urlFull = `${url}?${params.toString()}`;
    const res = await fetchWithRetry<BaseResponse<PaginationData<TData[]>>>({
      url: urlFull,
      method: "get",
    });

    if (res?.data?.data) {
      return {
        data: res.data.data.data || [],
        info: {
          count: res.data.data.totalData || 0,
          totalPages: res.data.data.totalPages || 0,
        },
      };
    }
    
    return {
      data: [],
      info: { count: 0, totalPages: 0 },
    };
  };

  const { data: queryData, isLoading: loading, refetch } = useQuery({
    queryKey: [
      "pagination",
      url,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      globalFilter,
      advancedFilter,
    ],
    queryFn: fetchData,
  });

  return {
    pagination,
    sorting,
    handlePageChange,
    handleSortingChange,
    data: queryData?.data || [],
    info: queryData?.info || { count: 0, totalPages: 0 },
    loading,
    handleGlobalFilterChange,
    globalFilter,
    refetch,
  };
};

export default usePagination;
