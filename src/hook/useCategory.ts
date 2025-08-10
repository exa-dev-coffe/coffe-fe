import {useState} from "react";
import {useCookies} from "react-cookie";
import useNotificationContext from "./useNotificationContext.ts";
import {
    type BodyCategory,
    type BodySetCategory,
    type Category,
    type CategoryOptions,
    CategorySchema,
    type ResponseGetCategory
} from "../model/category.ts";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate} from "../model";
import {ZodError} from "zod";

const useCategory = () => {
    const [data, setData] = useState<Category[]>([]);
    const [options, setOptions] = useState<CategoryOptions[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [cookies, _setCookies, removeCookie] = useCookies();
    const [error, setError] = useState({
        name: '',
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getCategory = async () => {
        setLoading(true);
        try {
            const url = '/api/admin/category?page=1&limit=10';
            const response = await fetchWithRetry<ResponseGetCategory>(
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
                setData(response.data.data);
                setTotalData(response.data.total_data)
                return response.data;
            } else {
                console.error(response);
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to fetch category data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error fetching category:', error);
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
                            message: errData.message || 'Failed to fetch category data.',
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
                    message: 'Failed to fetch category data. Please try again later.',
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

    const addCategory = async (category: BodyCategory) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            setError({
                name: '',
            })

            validate(category, CategorySchema)
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: '/api/admin/category',
                    method: 'post',
                    body: category,
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
                    message: 'Successfully Add Category',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to add category.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error adding category:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    name: '',
                }

                const dataMapError = formatErrorZod<BodyCategory>(error);

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
                            message: errData.message || 'Failed to add category.',
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
                    message: 'Failed to add category. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null
        } finally {
            setLoadingProgress(false)
        }
    }

    const setCategory = async (category: BodySetCategory) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: '/api/admin/category/set',
                    method: 'put',
                    body: category,
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
                    message: 'Successfully Set Item Category',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to set category.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error setting category:', error);
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
                            message: errData.message || 'Failed to set category.',
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
                    message: 'Failed to add category. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null
        } finally {
            setLoadingProgress(false)
        }
    }

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
                        removeCookie('token');
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to fetch category category.',
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
                    message: 'Failed to fetch category data. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null;
        }
    }

    const deleteCategory = async (id: number) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/admin/category?id=${id}`,
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
                    message: 'Successfully Delete Category.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to delete category.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error deleting category:', error);
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
                            message: errData.message || 'Failed to delete category.',
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
                    message: 'Failed to delete category. Please try again later.',
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
        if (loading) return
        setLoading(true);
        try {
            const url = `/api/admin/category?page=${page}&limit=10&search_field=name&search_value=${query.search}`;
            const response = await fetchWithRetry<ResponseGetCategory>(
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
                    message: 'Failed to search category data.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate category:", error);
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
                            message: errData.message || 'Failed to fetch category data.',
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
                    message: 'Failed to fetch category data. Please try again later.',
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
        getCategoryOptions,
        deleteCategory,
        setOptions,
        options,
        page,
        handlePaginate,
        totalData,
        loading,
        data,
        error,
        getCategory,
        addCategory,
        setCategory,
    }
}

export default useCategory;