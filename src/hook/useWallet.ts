import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError} from "../model";
import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {
    type BodySetPin,
    type HistoryBalance,
    PinShcema,
    type ResponseCheckWallet,
    type ResponseGetHistoryBalance,
    type ResponseTopUp
} from "../model/wallet.ts";
import {ZodError} from "zod";

const useWallet = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<HistoryBalance[]>([]);
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [error, setError] = useState<BodySetPin>({
        pin: '',
        confirmPin: ''
    })

    const checkWallet = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/balance';
            const response = await fetchWithRetry<ResponseCheckWallet>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                return response.data;
            } else {
                console.error(response);
                notification.errorNotificationClient('Failed to fetch wallet data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (error.response.status === 404) {
                        return null;
                    } else {
                        notification.errorNotificationClient(errData.message || 'Failed to fetch wallet data.', 'sm');
                    }
                } else {
                    notification.errorNotificationClient('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationClient('Failed to fetch wallet data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const setPin = async (data: BodySetPin) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            setError({
                pin: '',
                confirmPin: ''
            });
            validate(data, PinShcema);
            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/balance/activate',
                method: 'post',
                body: {
                    pin: data.pin
                },
            })
            if (res && res.data.success) {
                notification.successNotificationClient('Succesfully activate your wallet.', 'sm');
                return res.data;
            } else {
                notification.errorNotificationClient('Failed to activate wallet.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error activate wallet:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    pin: '',
                    confirmPin: ''
                }

                const dataMapError = formatErrorZod<BodySetPin>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationClient(errData.message || 'Failed to activate wallet.', 'sm');
                } else {
                    notification.errorNotificationClient('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationClient('Failed to activate wallet. Please try again later.', 'sm');
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    const handleTopUp = async (amount: number) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            const res = await fetchWithRetry<ResponseTopUp>({
                url: '/api/1.0/balance/top-up',
                method: 'post',
                body: {
                    amount: amount
                },
            });
            if (res && res.data.success) {
                return res.data;
            } else {
                notification.errorNotificationClient('Failed to top up wallet.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error topping up wallet:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationClient(errData.message || 'Failed to top up wallet.', 'sm');
                } else {
                    notification.errorNotificationClient('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationClient('Failed to top up wallet. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoadingProgress(false);
        }
    }

    const getHistoryBalance = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/balance-history?page=0&size=10&sort=createdAt,desc';
            const response = await fetchWithRetry<ResponseGetHistoryBalance>(
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
                notification.errorNotificationDashboard('Failed to fetch history data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch history data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch history data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    const handlePaginate = async (page: number,) => {
        if (loading) return;
        setLoading(true);
        try {
            const url = `/api/1.0/balance-history?page=${page}&size=10&sort=createdAt,desc`;
            const response = await fetchWithRetry<ResponseGetHistoryBalance>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                if (page === 1) {
                    setData(response.data.data.data);
                } else {
                    const dataTemp = [
                        ...data,
                        ...response.data.data.data
                    ]
                    setData(dataTemp);
                }
                setPage(page);
                setTotalData(response.data.data.totalData);
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to paginate history data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate history:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch history data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch history data. Please try again later.', 'sm');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }

    return {
        checkWallet,
        loading,
        setPin,
        getHistoryBalance,
        data,
        totalData,
        handleTopUp,
        error,
        page,
        handlePaginate,
        setData
    }
}

export default useWallet;