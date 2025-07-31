import {fetchWithRetry} from "../utils";
import type {ExtendedAxiosError, ResponseGetDashboard} from "../model";
import {useCookies} from "react-cookie";
import {useState} from "react";
import axios from "axios";
import useNotificationContext from "./useNotificationContext.ts";

const useDashboard = () => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [cookies, _setCookies, removeCookies] = useCookies()
    const notification = useNotificationContext()
    const [menuDashboard, setMenuDashboard] = useState([
        {
            title: "Menu",
            to: "/dashboard/manage-catalog",
            count: 10
        },
        {
            title: "Table",
            to: "/dashboard/manage-table",
            count: 10
        },
        {
            title: "Category",
            to: "/dashboard/manage-category",
            count: 10
        },
        {
            title: "Barista",
            to: "/dashboard/manage-barista",
            count: 10
        }
    ])

    const getDataDashboard = async () => {
        try {
            const res = await fetchWithRetry<ResponseGetDashboard>({
                url: "/api/admin/dashboard",
                method: "get",
                config: {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                        "Content-Type": "application/json"
                    }
                }

            })
            if (res && res.data.success) {
                setMenuDashboard((prev) => prev.map((item) => {
                        switch (item.title) {
                            case "Menu":
                                return {...item, count: res.data.data.count_menu};
                            case "Table":
                                return {...item, count: res.data.data.count_table};
                            case "Category":
                                return {...item, count: res.data.data.count_category};
                            case "Barista":
                                return {...item, count: res.data.data.count_barista};
                            default:
                                return item;
                        }
                    })
                );
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (errData.message.includes("token is expired")) {
                        removeCookies('token');
                        notification.setNotification({
                            type: 'error',
                            message: 'Session expired, please login again',
                            size: 'md',
                            duration: 3000,
                            mode: 'client',
                            isShow: true,
                        });
                        return null;
                    }
                    notification.setNotification({
                        type: 'error',
                        message: errData.message || 'Failed to fetch dashboard data',
                        size: 'md',
                        duration: 3000,
                        mode: 'client',
                        isShow: true,
                    });
                } else {
                    notification.setNotification({
                        type: 'error',
                        message: 'Network error or server is down',
                        size: 'md',
                        duration: 3000,
                        mode: 'client',
                        isShow: true,
                    });
                }
            } else {
                notification.setNotification({
                    type: 'error',
                    message: 'An unexpected error occurred while fetching profile',
                    size: 'md',
                    duration: 3000,
                    mode: 'client',
                    isShow: true,
                });
            }
            return null;
        }
    }

    return {
        menuDashboard,
        getDataDashboard
    };
}

export default useDashboard;