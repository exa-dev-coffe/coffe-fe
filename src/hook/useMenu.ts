import type {Menu, ResponseGetMenu} from "../model/menu.ts";
import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry} from "../utils";
import {useCookies} from "react-cookie";
import axios from "axios";
import type {ExtendedAxiosError} from "../model";

const useMenu = () => {
    const [data, setData] = useState<Menu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [cookies, setCookies] = useCookies();
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()

    const getMenu = async () => {
        setLoading(true);
        try {
            const response = await fetchWithRetry<ResponseGetMenu>(
                {
                    url: '/api/admin/menu',
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
                // setTotalData(response.data.total_data)
                setTotalData(response.data.total_data)
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch menu data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching menu:', error);
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
                        setCookies('token', '', {path: '/'});
                        return;
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to fetch menu data.',
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
                    message: 'Failed to fetch menu data. Please try again later.',
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

    const handleSearch = async (search: string) => {
        setLoading(true);
        try {
            const url = `/api/admin/menu?search_field=name&search_value=${search}`;
            const response = await fetchWithRetry<ResponseGetMenu>(
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
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to search menu data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error searching menu:', error);
            notification.setNotification({
                mode: 'dashboard',
                type: 'error',
                message: 'Failed to search menu data. Please try again later.',
                duration: 1000,
                isShow: true,
                size: 'sm'
            });
            return null;
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        totalData,
        handleSearch,
        getMenu,
        setLoading
    }
}

export default useMenu;