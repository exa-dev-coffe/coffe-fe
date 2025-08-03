import {useState} from "react";
import {useCookies} from "react-cookie";
import useNotificationContext from "./useNotificationContext.ts";
import type {Category, CategoryOptions, ResponseGetCategory} from "../model/category.ts";
import {fetchWithRetry} from "../utils";
import axios from "axios";
import type {ExtendedAxiosError} from "../model";

const useCategory = () => {
    const [data, setData] = useState<Category[]>([]);
    const [options, setOptions] = useState<CategoryOptions[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [cookies, setCookies] = useCookies();
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getCategoryOptions = async () => {
        try {
            const response = await fetchWithRetry<ResponseGetCategory>({
                url: "api/admin/category",
                method: "get",
                config: {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                        "Content-Type": "application/json",
                    },
                },
            })
            if (response && response.data.success) {
                const categoryTemp = response.data.data.map((category: Category) => ({
                    label: category.name,
                    value: category.id,
                }));
                setOptions(categoryTemp);
                return categoryTemp;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch categories.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
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
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to fetch menu category.',
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
        }
    }

    return {
        getCategoryOptions,
        setOptions,
        options
    }
}

export default useCategory;