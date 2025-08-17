import {useCookies} from "react-cookie";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError} from "../model";
import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {type BodySetPin, PinShcema, type ResponseCheckWallet} from "../model/wallet.ts";
import {ZodError} from "zod";

const useWallet = () => {
    const [cookies, _setCookie, removeCookie] = useCookies()
    const [loading, setLoading] = useState<boolean>(false);
    const notification = useNotificationContext()
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [error, setError] = useState<BodySetPin>({
        pin: '',
        confirmPin: ''
    })

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
                            mode: 'client',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'client',
                            type: 'error',
                            message: errData.message || 'Failed to fetch wallet data.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'client',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'client',
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
                url: '/api/user/balance/activate',
                method: 'put',
                body: {
                    pin: parseInt(data.pin)
                },
                config: {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            })
            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'client',
                    type: 'success',
                    message: 'Succesfully activate your wallet.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'client',
                    type: 'error',
                    message: 'Failed to activate wallet.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
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
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            mode: 'client',
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'client',
                            type: 'error',
                            message: errData.message || 'Failed to activate wallet.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'client',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'client',
                    type: 'error',
                    message: 'Failed to activate wallet. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        } finally {
            setLoadingProgress(false);
        }
    }

    return {
        checkWallet,
        loading,
        setPin,
        error
    }
}

export default useWallet;