import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import {ZodError} from "zod";
import {
    type BodyTable,
    type ResponseGetTableNoPagination,
    type ResponseGetTablePagination,
    type Table,
    TableSchema
} from "../model/table.ts";

const useTable = () => {
    const [data, setData] = useState<Table[]>([]);
    const [options, setOptions] = useState<{ value: number; label: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [error, setError] = useState({
        name: '',
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getTable = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/tables?page=1&size=10';
            const response = await fetchWithRetry<ResponseGetTablePagination>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                setData(response.data.data.data);
                setTotalData(response.data.data.totalData)
                return response.data;
            } else {
                console.error(response);
                notification.errorNotificationDashboard('Failed to fetch table data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching table:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch table data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch table data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const getTableOptions = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/tables?noPaginate=true';
            const response = await fetchWithRetry<ResponseGetTableNoPagination>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                const data = response.data.data.map((table) => ({
                    value: table.id,
                    label: table.name
                }));
                setOptions(data);
                return response.data;
            } else {
                console.error(response);
                notification.errorNotificationDashboard('Failed to fetch table data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching table:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch table data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch table data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const addTable = async (data: BodyTable) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            setError({
                name: ''
            });
            validate(data, TableSchema);
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/tables',
                method: 'post',
                body: data,
            })
            if (res && res.data.success) {
                notification.successNotificationDashboard('Succesfully Add New Table.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to add table.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error adding table:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    name: ''
                }

                const dataMapError = formatErrorZod<BodyTable>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to add table.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to add table. Please try again later.', 'sm');
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const updateTable = async (data: BodyTable & {
        id: number;
    }) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            setError({
                name: ''
            });
            validate(data, TableSchema);
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/tables',
                method: 'put',
                body: data,
            })
            if (res && res.data.success) {
                notification.successNotificationDashboard('Succesfully Update Table.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to update table.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error updating table:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    name: ''
                }

                const dataMapError = formatErrorZod<BodyTable>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to update table.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to update table. Please try again later.', 'sm');
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const deleteTable = async (id: number) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/1.0/tables?id=${id}`,
                    method: 'delete',
                }
            )
            if (response && response.data.success) {
                notification.successNotificationDashboard('Successfully Delete Table.', 'sm');
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to delete table.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to delete table.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to delete table. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoadingProgress(false);
        }
    }

    const handlePaginate = async (page: number, query: queryPaginate) => {
        if (loading) return;
        setLoading(true);
        try {
            const url = `/api/1.0/tables?page=${page}&size=10&searchValue=${query.search || ''}&searchKey=name`;
            const response = await fetchWithRetry<ResponseGetTablePagination>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                setData(response.data.data.data);
                setTotalData(response.data.data.totalData);
                setPage(page);
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to search table data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate table:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch table data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch table data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        totalData,
        handlePaginate,
        getTable,
        setLoading,
        page,
        error,
        addTable,
        updateTable,
        deleteTable,
        getTableOptions,
        options,
        setOptions
    }
}

export default useTable;