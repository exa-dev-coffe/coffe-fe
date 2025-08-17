import {useCookies} from "react-cookie";
import {fetchWithRetry} from "../utils";
import axios from "axios";
import type {ExtendedAxiosError} from "../model";
import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import type {ResponseCheckWallet} from "../model/wallet.ts";

const useWallet = () => {
    const [cookies, _setCookie, removeCookie] = useCookies()
    const [loading, setLoading] = useState<boolean>(false);
    const notification = useNotificationContext()

    const checkWallet = async () => {
        setLoading(true);
        try {
            const url = '/api/user/balance';
            const response = await fetchWithRetry<ResponseCheckWallet>(
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
                return response.data;
            } else {
                console.error(response);
                notification.setNotification({
                    mode: 'client',
                    type: 'error',
                    message: 'Failed to fetch wallet data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching wallet:', error);
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
                            message: errData.message || 'Failed to fetch wallet data.',
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
                    message: 'Failed to fetch wallet data. Please try again later.',
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
        checkWallet,
        loading
    }
}

export default useWallet;