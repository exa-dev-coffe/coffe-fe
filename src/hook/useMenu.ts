import {
    type BodyMenu,
    type Menu,
    MenuSchema,
    type ResponseGetMenuByCategory,
    type ResponseGetMenuById,
    type ResponseGetMenuPagination
} from "../model/menu.ts";
import {useState} from "react";
import useNotificationContext from "./useNotificationContext.ts";
import {fetchWithRetry, formatErrorZod, validate} from "../utils";
import {useCookies} from "react-cookie";
import axios from "axios";
import type {BaseResponse, ExtendedAxiosError, queryPaginate, ResponseUploadFoto} from "../model";
import {ZodError} from "zod";
import {useNavigate} from "react-router";
import {jwtDecode} from "jwt-decode";
import type {PayloadJWT} from "../model/auth.ts";

const useMenu = () => {
    const [data, setData] = useState<Menu[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);
    const [cookies] = useCookies();
    const [error, setError] = useState({
        name: '',
        description: '',
        price: '',
        photo: ''
    });
    const [totalData, setTotalData] = useState<number>(0);
    const notification = useNotificationContext()
    const [page, setPage] = useState<number>(1);
    const navigate = useNavigate();

    const getMenu = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/menus?page=1&size=10';
            const response = await fetchWithRetry<ResponseGetMenuPagination>(
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

                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch menu data.',
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

    const getMenuById = async (id: number) => {
        setLoading(true);
        try {
            const url = '/api/1.0/menus/detail?id=' + id;
            const response = await fetchWithRetry<ResponseGetMenuById>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                return response.data.data;
            } else {
                console.error(response);
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch menu data.',
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

    const getMenuUncategorized = async () => {
        setLoading(true);
        try {
            const url = '/api/1.0/menus/uncategorized?page=1&size=10';
            const response = await fetchWithRetry<ResponseGetMenuPagination>(
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch menu data.',
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

    const getMenuByCategory = async (id: number) => {
        setLoading(true);
        try {
            const url = '/api/1.0/menus/by-category?id=' + id;
            const response = await fetchWithRetry<ResponseGetMenuByCategory>(
                {
                    url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                setData(response.data.data || []);
                return response.data;
            } else {
                console.error(response);
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch menu data.',
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

    const addMenu = async (menu: BodyMenu) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            setError({
                name: '',
                description: '',
                price: '',
                photo: ''
            })

            validate(menu, MenuSchema)

            if (!menu.photo) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Menu photo is required.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                setError({
                    photo: 'Menu photo is required.',
                    name: '',
                    description: '',
                    price: ''
                });
                return null;
            }
            const resUploadFoto = await uploadMenuPhoto(menu.photo as File);
            if (!resUploadFoto) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to upload menu photo.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
            menu.photo = resUploadFoto.data.url; // Use the uploaded file path
            const responseAddMenu = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: '/api/1.0/menus',
                    method: 'post',
                    body: menu,
                }
            )
            if (responseAddMenu && responseAddMenu.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Successfully Add Menu',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                navigate('/dashboard/manage-catalog');
                return responseAddMenu.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to add menu.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }

        } catch (error) {
            console.error('Error adding menu:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    photo: '',
                    name: '',
                    description: '',
                    price: ''
                }

                const dataMapError = formatErrorZod<BodyMenu>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (typeof menu.photo === 'string' && menu.photo.startsWith('https')) {
                    deleteMenuPhoto(menu.photo);
                }
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to add menu.',
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
                    message: 'Failed to add menu. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        } finally {
            setLoadingProgress(false)
        }
    }

    const editMenu = async (menu: BodyMenu) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            setError({
                name: '',
                description: '',
                price: '',
                photo: ''
            })

            validate(menu, MenuSchema)

            if (!menu.photo) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Menu photo is required.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                setError({
                    photo: 'Menu photo is required.',
                    name: '',
                    description: '',
                    price: ''
                });
                return null;
            }

            if (menu.photo && menu.photo instanceof File) {
                const resUploadFoto = await uploadMenuPhoto(menu.photo as File);
                if (!resUploadFoto) {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Failed to upload menu photo.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                    return null;
                }
                menu.photo = resUploadFoto.data.url; // Use the uploaded file path
            }
            const responseEditMenu = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: '/api/1.0/menus',
                    method: 'put',
                    body: menu,
                }
            )
            if (responseEditMenu && responseEditMenu.data.success) {
                if (menu.photoBefore && menu.photoBefore.startsWith('https') && menu.photoBefore !== menu.photo) {
                    deleteMenuPhoto(menu.photoBefore);
                }
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Successfully Edit Menu',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                navigate('/dashboard/manage-catalog');
                return responseEditMenu.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to edit menu.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error editing menu:', error);
            if (error instanceof ZodError) {
                const defaultErrorMap = {
                    photo: '',
                    name: '',
                    description: '',
                    price: ''
                }

                const dataMapError = formatErrorZod<BodyMenu>(error);

                Object.assign(defaultErrorMap, dataMapError);

                setError(defaultErrorMap);

                return null;
            } else if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to edit menu.',
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
                    message: 'Failed to edit menu. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null;
        } finally {
            setLoadingProgress(false)
        }
    }

    const updateAvailableMenu = async (id: number, isAvailable: boolean) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {

            const res = await fetchWithRetry<BaseResponse<null>>({
                url: '/api/1.0/menu/availability',
                body: {
                    id: id,
                    isAvailable: isAvailable
                },
                method: 'patch',
            })
            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: `Successfully update status`,
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return res.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to update status.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error updating available menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to update status menu.',
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
                    message: 'Failed to status menu. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
            return null;
        } finally {
            setLoadingProgress(false)
        }
    }

    const uploadMenuPhoto = async (file: File) => {
        try {
            const dataForm = new FormData();
            dataForm.append('file', file);
            const resUpload = await fetchWithRetry<ResponseUploadFoto>({
                url: "/api/1.0/upload/upload-menu",
                config: {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
                method: "post",
                body: dataForm,
            })
            if (resUpload && resUpload.data.success) {
                return resUpload.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to upload menu photo.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error uploading menu photo:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to upload menu photo.',
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
                    message: 'Failed to upload menu photo. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        }
    }

    const deleteMenuPhoto = async (url: string) => {
        try {
            const resDelete = await fetchWithRetry<BaseResponse<null>>({
                url: `/api/1.0/upload/delete-menu?url=${encodeURIComponent(url)}`,
                method: "delete"
            })
            if (resDelete && resDelete.data.success) {
                return resDelete.data;
            } else {
                return null
            }
        } catch (error) {
            console.error('Error deleting menu photo:', error);
            return null
        }
    }

    const deleteMenu = async (id: number) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/1.0/menus?id=${id}`,
                    method: 'delete',
                }
            )
            if (response && response.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Successfully Delete Menu',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return response.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to delete menu.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
                return null;
            }
        } catch (error) {
            console.error('Error deleting menu:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to delete menu.',
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
                    message: 'Failed to delete menu. Please try again later.',
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

    const handlePaginate = async (page: number, query: queryPaginate, urlParam?: string) => {
        if (loading) return;
        setLoading(true);
        try {
            let url = urlParam ? `${urlParam}?page=${page}&size=10` : `/api/1.0/menus?page=${page}&size=10`;

            let searchKey = '';
            let searchValue = '';
            if (query.search) {
                searchKey = 'name';
                searchValue = query.search;
            }
            if (query.category_id) {
                searchKey += (searchKey ? ',categoryId' : 'categoryId');
                searchValue += (searchValue ? `,${query.category_id}` : query.category_id);
            }
            if (searchKey && searchValue) {
                url += `&searchKey=${searchKey}&searchValue=${searchValue}`;
            }
            const response = await fetchWithRetry<ResponseGetMenuPagination>(
                {
                    url: url,
                    method: 'get',
                }
            )
            if (response && response.data.success) {
                if (cookies.token) {
                    const role = jwtDecode<PayloadJWT>(cookies.token).role;
                    if (role === 'user') {
                        if (page === 1) {
                            setData(response.data.data.data);
                        } else {
                            const dataTemp = [
                                ...data,
                                ...response.data.data.data
                            ]
                            setData(dataTemp);
                        }
                    } else {
                        setData(response.data.data.data);
                    }
                } else {
                    if (page === 1) {
                        setData(response.data.data.data);
                    } else {
                        const dataTemp = [
                            ...data,
                            ...response.data.data.data
                        ]
                        setData(dataTemp);
                    }
                }
                setPage(page);
                setTotalData(response.data.data.totalData);
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
            console.error("Error fetch paginate menu:", error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to fetch menu data.',
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

    return {
        data,
        loading,
        totalData,
        handlePaginate,
        deleteMenu,
        getMenu,
        addMenu,
        setLoading,
        page,
        getMenuUncategorized,
        editMenu,
        getMenuByCategory,
        error,
        getMenuById,
        updateAvailableMenu
    }
}

export default useMenu;