import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import {type Barista, BaristaSchema, type BodyBarista, type ResponseGetBarista} from "../model/barista.ts";
import {ZodError} from "zod";

const useBarista = () => {
    const [data, setData] = useState<Barista[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [error, setError] = useState({
        password: '',
        email: '',
        fullName: '',
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getBarista = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/barista/list-barista?page=1&size=10';
            const response = await fetchWithRetry<ResponseGetBarista>(
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
                notification.errorNotificationDashboard('Failed to fetch barista data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching barista:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch barista data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch barista data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const addBarista = async (data: BodyBarista) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            setError({
                password: '',
                email: '',
                fullName: '',
            });
            validate(data, BaristaSchema);
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/barista/register-barista',
                method: 'post',
                body: data,
            })
            if (res && res.data.success) {
                notification.successNotificationDashboard('Succesfully Add New Barista.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to add barista.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error adding barista:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    password: '',
                    email: '',
                    fullName: '',
                }

                const dataMapError = formatErrorZod<BodyBarista>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to add barista.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to add barista. Please try again later.', 'sm');
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const deleteBarista = async (id: number) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/1.0/barista?userId=${id}`,
                    method: 'delete',
                }
            )
            if (response && response.data.success) {
                notification.successNotificationDashboard('Successfully Delete Barista.', 'sm');
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to delete barista.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to delete barista.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to delete barista. Please try again later.', 'sm');
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
            const url = `/api/1.0/barista/list-barista?page=${page}&size=10&searchValue=${query.search || ''}&searchKey=email`;
            const response = await fetchWithRetry<ResponseGetBarista>(
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
                notification.errorNotificationDashboard('Failed to search barista data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate barista:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch barista data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch barista data. Please try again later.', 'sm');
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
        getBarista,
        setLoading,
        page,
        error,
        addBarista,
        deleteBarista,
    }
}

export default useBarista;