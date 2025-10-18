import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry} from "../utils";
import {useCookies} from "react-cookie";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import type {BodyOrder, BodySetStatusOrder, Order, ResponseGetOrder, ResponseGetOrderById} from "../model/order.ts";
import {jwtDecode} from "jwt-decode";
import type {PayloadJWT} from "../model/auth.ts";

const useOrder = () => {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [cookies,] = useCookies();
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getOrder = async () => {
        setLoading(true);
        try {
            let url = '/api/1.0/history-checkouts?page=1&size=10';
            if (cookies.token) {
                const role = jwtDecode<PayloadJWT>(cookies.token).role;
                if (role === 'barista') {
                    url = '/api/1.0/transactions?page=1&size=10&searchField=name&search_value=';
                }

            }

            const response = await fetchWithRetry<ResponseGetOrder>(
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch order data.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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

    const getOrderById = async (id: number) => {
        setLoading(true);
        try {
            let url = '/api/1.0/history-checkouts/detail?id=' + id;
            if (cookies.token) {
                const role = jwtDecode<PayloadJWT>(cookies.token).role;
                if (role === 'barista') {
                    url = '/api/1.0/transactions/detail?id=' + id;
                }

            }

            const response = await fetchWithRetry<ResponseGetOrderById>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch order data.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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

    const updateStatusOrder = async (data: BodySetStatusOrder) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/transactions/update-order-status',
                method: 'patch',
                body: data,
            })
            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Succesfully Update Order.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to update order.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error updating order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to update order.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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
                    message: 'Failed to update order. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const handlePaginate = async (page: number, query: queryPaginate) => {
        if (loading) return;
        setLoading(true);
        try {
            let url = `/api/barista/transaction?page=${page}&size=10&searchValue=${query.search || ''}&searchField=name`;
            if (cookies.token) {
                const role = jwtDecode<PayloadJWT>(cookies.token).role;
                if (role !== 'barista') {
                    url = `/api/checkout-history?page=${page}&size=10&searchValue=${query.search || ''}&searchField=name`;
                }
            }
            const response = await fetchWithRetry<ResponseGetOrder>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                if (cookies.token) {
                    const role = jwtDecode<PayloadJWT>(cookies.token).role;
                    if (role === 'user') {
                        setData([
                            ...data,
                            ...response.data.data.data
                        ])
                    } else {
                        setData(response.data.data.data);
                    }
                } else {
                    setData(response.data.data.data);
                }

                setTotalData(response.data.data.totalData);
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch order data.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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

    const handleCheckout = async (data: BodyOrder) => {
        if (loadingProgress) return null;
        setLoadingProgress(true);
        try {
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/checkout',
                method: 'post',
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
                    message: 'Successfully checkout order.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to checkout order.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error checking out order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to checkout order.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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
                    message: 'Failed to checkout order. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null
        } finally {
            setLoadingProgress(false);
        }
    }

    const handleSetRate = async (rating: number, id: number) => {
        if (loadingProgress) return null;
        setLoadingProgress(true);
        try {
            const data = {
                id: id,
                rating: rating
            }
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/history-checkouts/set-rating-menu',
                method: 'patch',
                body: data,
            })
            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Successfully rating menu.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to rate menu.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error  rating menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to  rate menu.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
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
                    message: 'Failed to rate menu. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null
        } finally {
            setLoadingProgress(false);
        }
    }

    return {
        data,
        loading,
        totalData,
        handleSetRate,
        handlePaginate,
        getOrder,
        setLoading,
        page,
        updateStatusOrder,
        handleCheckout,
        getOrderById
    }
}

export default useOrder;