import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {
    type BodyCategory,
    type BodySetCategory,
    type Category,
    type CategoryOptions,
    CategorySchema,
    type ResponseGetCategoryNoPagination,
    type ResponseGetCategoryPagination
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
    const [error, setError] = useState({
        name: '',
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);

    const getCategory = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/categories?page=1&size=10';
            const response = await fetchWithRetry<ResponseGetCategoryPagination>(
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
                notification.errorNotificationDashboard('Failed to fetch category data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error fetching category:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch category data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch category data. Please try again later.', 'sm');
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
                    url: '/api/1.0/categories',
                    method: 'post',
                    body: category,
                }
            )
            if (response && response.data.success) {
                notification.successNotificationDashboard('Successfully Add Category', 'sm');
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to add category.', 'sm');
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
                    notification.errorNotificationDashboard(errData.message || 'Failed to add category.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to add category. Please try again later.', 'sm');
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
                    url: '/api/1.0/menus/set-category',
                    method: 'patch',
                    body: category,
                }
            )
            if (response && response.data.success) {
                notification.successNotificationDashboard('Successfully Set Item Category', 'sm');
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to set category.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error setting category:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to set category.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to add category. Please try again later.', 'sm');
            }
            return null
        } finally {
            setLoadingProgress(false)
        }
    }

    const getCategoryOptions = async () => {
        try {
            const url = '/api/1.0/categories?noPaginate=true';
            const response = await fetchWithRetry<ResponseGetCategoryNoPagination>({
                url,
                method: "get",
            })
            if (response && response.data.success) {
                const categoryTemp = response.data.data.map((category: Category) => ({
                    label: category.name,
                    value: category.id,
                }));
                setOptions(categoryTemp);
                return categoryTemp;
            } else {
                notification.errorNotificationDashboard('Failed to fetch categories.', 'sm');
                return null
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch category category.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch category data. Please try again later.', 'sm');
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
                    url: `/api/1.0/categories?id=${id}`,
                    method: 'delete',
                }
            )
            if (response && response.data.success) {
                notification.successNotificationDashboard('Successfully Delete Category.', 'sm');
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to delete category.', 'sm');
                return null;
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to delete category.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to delete category. Please try again later.', 'sm');
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
            const url = `/api/1.0/categories?page=${page}&size=10&searchKey=name&searchValue=${query.search}`;
            const response = await fetchWithRetry<ResponseGetCategoryPagination>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                setData(response.data.data.data);
                setTotalData(response.data.data.totalData);
                setPage(page);
                return response.data;
            } else {
                notification.errorNotificationDashboard('Failed to search category data.', 'sm');
                return null;
            }
        } catch (error) {
            console.error("Error fetch paginate category:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.errorNotificationDashboard(errData.message || 'Failed to fetch category data.', 'sm');
                } else {
                    notification.errorNotificationDashboard('Network error or server is down.', 'sm');
                }
            } else {
                notification.errorNotificationDashboard('Failed to fetch category data. Please try again later.', 'sm');
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