import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry, formatDate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import type {
    BodyOrder,
    BodySetStatusOrder,
    Order,
    ResponseGetOrder,
    ResponseGetOrderById,
    ResponseGetSummaryReport
} from "../model/order.ts";
import {jwtDecode} from "jwt-decode";
import type {PayloadJWT} from "../model/auth.ts";
import Cookie from "../utils/cookie.ts";

const useOrder = () => {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1)

    const getOrder = async () => {
        setLoading(true);
        try {
            let url = '/api/1.0/history-checkouts?page=1&size=10';
            const token = Cookie.get('token');
            if (token) {
                const role = jwtDecode<PayloadJWT>(token).role;
                if (role === 'barista') {
                    url = `/api/1.0/transactions?page=1&size=10&searchField=name&searchValue=&sort=order_status,asc&startDate=${formatDate(new Date().toISOString())}&endDate=${formatDate(new Date().toISOString())}`;
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
                notification.errorNotificationDashboard('Failed to fetch order data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch order data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch order data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const getOrderById = async (id: number) => {
        setLoading(true);
        try {
            const token = Cookie.get('token');
            let url = '/api/1.0/history-checkouts/detail?id=' + id;
            if (token) {
                const role = jwtDecode<PayloadJWT>(token).role;
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
                notification.errorNotificationDashboard('Failed to fetch order data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch order data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch order data. Please try again later.', 'sm');
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
                notification.successNotificationDashboard('Succesfully Update Order.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to update order.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error updating order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to update order.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to update order. Please try again later.', 'sm');
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const handlePaginate = async (page: number, query: queryPaginate) => {
        if (loading) return;
        setLoading(true);
        try {
            const token = Cookie.get('token');
            let url = `/api/1.0/transactions?page=${page}&size=10&searchValue=${query.search || ''}&searchKey=orderFor&startDate=${query.startDate}&endDate=${query.endDate}`;
            if (token) {
                const role = jwtDecode<PayloadJWT>(token).role;
                if (role !== 'barista') {
                    url = `/api/1.0/history-checkouts?page=${page}&size=10&searchValue=${query.search || ''}&searchKey=orderFor`;
                }
            }
            const response = await fetchWithRetry<ResponseGetOrder>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                const token = Cookie.get('token');
                if (token) {
                    const role = jwtDecode<PayloadJWT>(token).role;
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
                notification.errorNotificationDashboard('Failed to search order data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate order:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch order data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch order data. Please try again later.', 'sm');
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
            })
            if (res && res.data.success) {
                notification.successNotificationDashboard('Successfully checkout order.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to checkout order.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error checking out order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to checkout order.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to checkout order. Please try again later.', 'sm');
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
                notification.successNotificationDashboard('Successfully rating menu.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationDashboard('Failed to rate menu.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error  rating menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to  rate menu.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to rate menu. Please try again later.', 'sm');
            }
            return null
        } finally {
            setLoadingProgress(false);
        }
    }

    const getSummaryOrder = async (startDate: string, endDate: string) => {
        setLoading(true);
        try {
            const url = `/api/1.0/transactions/summary-report?startDate=${startDate}&endDate=${endDate}`;

            const response = await fetchWithRetry<ResponseGetSummaryReport>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                return response.data.data;
            } else {
                console.error(response);
                notification.errorNotificationDashboard('Failed to fetch summary order data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching summary order:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch summary order data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch summary order data. Please try again later.', 'sm');
            }
            return null
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        getSummaryOrder,
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