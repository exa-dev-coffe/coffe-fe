import {useCallback, useEffect, useState} from "react";
import type {PaginationState, SortingState, Updater} from "@tanstack/react-table";
import {fetchWithRetry} from "../utils";
import type {BaseResponse, PaginationData} from "../model";

interface UsePaginationParams {
    url: string;
    filterColumn: string[];
    advancedFilter: Record<string, string | number>;
}

const usePagination = <TData>({url, filterColumn, advancedFilter}: UsePaginationParams) => {
    const [pagination, setPagination] = useState<PaginationState>({pageIndex: 0, pageSize: 10});
    const [info, setInfo] = useState({count: 0, totalPages: 0});
    const [data, setData] = useState<TData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");

    const handlePageChange = (updater: Updater<PaginationState>) => {
        setPagination((old) => (typeof updater === "function" ? updater(old) : updater));
    };

    const handleSortingChange = (updater: Updater<SortingState>) => {
        setSorting((old) => (typeof updater === "function" ? updater(old) : updater));
        setPagination((old) => ({...old, pageIndex: 0}));
    };

    const handleGlobalFilterChange = (updater: Updater<string>) => {
        setGlobalFilter((old) => (typeof updater === "function" ? updater(old) : updater));
        setPagination((old) => ({...old, pageIndex: 0}));
    };

    const getData = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            const fieldSort = sorting[0]?.id;
            const directionSort = sorting[0]?.desc ? "desc" : "asc";

            params.append("page", (pagination.pageIndex + 1).toString());
            params.append("size", pagination.pageSize.toString());
            if (fieldSort) params.append("sort", `${fieldSort},${directionSort}`);
            if (globalFilter) {
                let searchKeys = "";
                let searchValues = "";
                filterColumn.forEach((column) => {
                    searchKeys += `${column},`;
                    searchValues += `${globalFilter},`;
                });
                params.append("searchKey", searchKeys);
                params.append("searchValue", searchValues);
            }

            if (advancedFilter) {
                Object.entries(advancedFilter).forEach(([key, value]) => {
                    params.append(key, value.toString());
                })
            }

            const urlFull = `${url}?${params.toString()}`;
            const res = await fetchWithRetry<BaseResponse<PaginationData<TData[]>>>({url: urlFull, method: "get"});

            if (res?.data?.data) {
                setData(res.data.data.data);
                setInfo({count: res.data.data.totalData, totalPages: res.data.data.totalPages});
            } else {
                setData([]);
                setInfo({count: 0, totalPages: 0});
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, url, filterColumn, loading]);


    useEffect(() => {
        getData();
    }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, advancedFilter]);

    return {
        pagination,
        sorting,
        handlePageChange,
        handleSortingChange,
        data,
        info,
        loading,
        handleGlobalFilterChange,
    };
};

export default usePagination;
