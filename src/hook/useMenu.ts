import {
    type BodyMenu,
    type Menu,
    MenuSchema,
    type ResponseGetMenu,
    type ResponseGetMenuByCategory
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
    const [cookies, _setCookies, removeCookie] = useCookies();
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

    const getMenu = async (isDetail: boolean = false, id?: number) => {
        setLoading(true);
        try {
            let url = '/api/menu?page=1&limit=12';
            if (cookies.token) {
                const role = jwtDecode<PayloadJWT>(cookies.token).role;
                if (role === 'barista') {
                    url = '/api/barista/menu?page=1&limit=10';
                } else if (role === 'admin') {
                    url = '/api/admin/menu?page=1&limit=10';
                }
            }
            if (isDetail) {
                url += `&search_field=id&search_value=${id}`;
            }
            const response = await fetchWithRetry<ResponseGetMenu>(
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
                if (isDetail) {
                    if (response.data.total_data === 0) {
                        return null;
                    } else {
                        return response.data.data[0];
                    }
                }
                setData(response.data.data);
                setTotalData(response.data.total_data)
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

    const getMenuUncategorized = async () => {
        setLoading(true);
        try {
            const url = '/api/admin/category/uncategorized?page=1&limit=10';
            const response = await fetchWithRetry<ResponseGetMenu>(
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
                        removeCookie('token')
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

    const getMenuByCategory = async (id: number) => {
        setLoading(true);
        try {
            const url = '/api/admin/category/detail?id=' + id;
            const response = await fetchWithRetry<ResponseGetMenuByCategory>(
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
                setData(response.data.data.menus || []);
                setTotalData(response.data.total_data)
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

            if (menu.photo) {
                const resUploadFoto = await uploadMenuPhoto(menu.photo as File);
                if (resUploadFoto) {
                    menu.photo = resUploadFoto.data.file_path; // Use the uploaded file path
                    const responseAddMenu = await fetchWithRetry<BaseResponse<null>>(
                        {
                            url: '/api/admin/menu',
                            method: 'post',
                            body: menu,
                            config: {
                                headers: {
                                    Authorization: `Bearer ${cookies.token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
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
            } else {
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
                            message: errData.message || 'Failed to add menu.',
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

            if (menu.photo && menu.photo instanceof File) {
                const resUploadFoto = await uploadMenuPhoto(menu.photo as File);
                if (resUploadFoto) {
                    menu.photo = resUploadFoto.data.file_path; // Use the uploaded file path
                    const responseAddMenu = await fetchWithRetry<BaseResponse<null>>(
                        {
                            url: '/api/admin/menu',
                            method: 'put',
                            body: menu,
                            config: {
                                headers: {
                                    Authorization: `Bearer ${cookies.token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        }
                    )
                    if (responseAddMenu && responseAddMenu.data.success) {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'success',
                            message: 'Successfully Edit Menu',
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
                            message: 'Failed to edit menu.',
                            duration: 1000,
                            isShow: true,
                            size: 'sm'
                        });
                        return null;
                    }
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
            } else if (menu.photo.startsWith('http')) {
                menu.photo = menu.photo.split(import.meta.env.VITE_APP_IMAGE_URL)[1]; // Use the existing photo path

                const responseAddMenu = await fetchWithRetry<BaseResponse<null>>(
                    {
                        url: '/api/admin/menu',
                        method: 'put',
                        body: menu,
                        config: {
                            headers: {
                                Authorization: `Bearer ${cookies.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    }
                )
                if (responseAddMenu && responseAddMenu.data.success) {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'success',
                        message: 'Successfully Edit Menu',
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
                        message: 'Failed to edit menu.',
                        duration: 1000,
                        isShow: true,
                        size: 'sm'
                    });
                    return null;
                }
            } else {
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
                            message: errData.message || 'Failed to edit menu.',
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
                url: '/api/barista/menu/availability',
                body: {
                    id: id,
                    is_available: isAvailable
                },
                method: 'put',
                config: {
                    headers: {
                        Authorization: `Bearer ${cookies.token}`,
                        'Content-Type': 'application/json'
                    }
                }
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
                            message: errData.message || 'Failed to update status menu.',
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
            dataForm.append('module', 'menu')
            const resUpload = await fetchWithRetry<ResponseUploadFoto>({
                url: "/api/uploads",
                config: {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${cookies.token}`
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
                            message: errData.message || 'Failed to upload menu photo.',
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
                    message: 'Failed to upload menu photo. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'sm'
                });
            }
        }
    }

    const deleteMenu = async (id: number) => {
        if (loadingProgress) return
        setLoadingProgress(true);
        try {
            const response = await fetchWithRetry<BaseResponse<null>>(
                {
                    url: `/api/admin/menu?id=${id}`,
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
                            message: errData.message || 'Failed to delete menu.',
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

    const handlePaginate = async (page: number, query: queryPaginate, isCustom: boolean = false, endpoint?: string) => {
        if (loading) return;
        setLoading(true);
        try {
            let url = `/api/menu?page=${page}&limit=12`;
            if (cookies.token) {
                const role = jwtDecode<PayloadJWT>(cookies.token).role;
                if (role === 'barista') {
                    url = `/api/barista/menu?page=${page}&limit=10`;
                } else if (role === 'admin') {
                    url = `/api/admin/menu?page=${page}&limit=10`;
                }
                if (isCustom && endpoint) {
                    url = `${endpoint}?page=${page}&limit=10`;
                }
            }
            if (query.search) {
                url += `&search_field=name&search_value=${query.search}`;
            }
            if (query.category_id) {
                url += `&search_field=category_id&search_value=${query.category_id}`;
            }
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
                if (cookies.token) {
                    const role = jwtDecode<PayloadJWT>(cookies.token).role;
                    if (role === 'user') {
                        if (page === 1) {
                            setData(response.data.data);
                        } else {
                            const dataTemp = [
                                ...data,
                                ...response.data.data
                            ]
                            setData(dataTemp);
                        }
                    } else {
                        setData(response.data.data);
                    }
                } else {
                    if (page === 1) {
                        setData(response.data.data);
                    } else {
                        const dataTemp = [
                            ...data,
                            ...response.data.data
                        ]
                        setData(dataTemp);
                    }
                }
                setPage(page);
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
            console.error("Error fetch paginate menu:", error);
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
        updateAvailableMenu
    }
}

export default useMenu;