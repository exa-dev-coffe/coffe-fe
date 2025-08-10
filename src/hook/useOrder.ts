import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import {useCookies} from "react-cookie";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import {ZodError} from "zod";
import {type BodyTable, TableSchema} from "../model/table.ts";
import type {Order, ResponseGetOrder} from "../model/order.ts";

const useOrder = () => {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [cookies, _setCookies, removeCookie] = useCookies();
    const [error, setError] = useState({
        name: '',
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getOrder = async (isDetail: boolean = false, id?: number) => {
        setLoading(true);
        try {
            let url = '/api/barista/transaction?page=1&limit=10';
            if (isDetail && id) {
                url = `/api/barista/transaction?search_field=th_user_checkouts.id&search_value=${id}`;
            }
            const response = await fetchWithRetry<ResponseGetOrder>(
                {
                    url,
                    method: 'get',
                    config: {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                }
            )
            if (response && response.data.success) {
                if (isDetail) {
                    if (response.data.total_data === 0) {
                        return null;
                    } else {
                        return response.data.data[0];
                    }
                }
                setData(response.data.data);
                setTotalData(response.data.total_data)
                return response.data;
            } else {
                console.error(response);
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch order data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to fetch order data.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch order data. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null;
        } finally {
            setLoading(false);
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
                url: '/api/admin/tables',
                method: 'put',
                body: data,
                config: {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            })
            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Succesfully Update Table.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to update table.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
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
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to update table.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to update table. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const deleteTable = async (id: number) => {
        setLoadingProgress(true);
        if (loadingProgress) return
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/admin/tables?id=${id}`,
                    method: 'delete',
                    config: {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                }
            )
            if (response && response.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Successfully Delete Table.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to delete table.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to delete table.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to delete table. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
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
            const url = `/api/barista/transaction?page=${page}&limit=10&search_value=${query.search || ''}&search_field=tm_tables.name`;
            const response = await fetchWithRetry<ResponseGetOrder>(
                {
                    url: url,
                    method: 'get',
                    config: {
                        headers: {
                            Authorization: `Bearer ${cookies.token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                }
            )
            if (response && response.data.success) {
                setData(response.data.data);
                setTotalData(response.data.total_data);
                setPage(page);
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to search order data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate order:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to fetch order data.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch order data. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
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
        getOrder,
        setLoading,
        page,
        error,
        updateTable,
        deleteTable,
    }
}

export default useOrder;