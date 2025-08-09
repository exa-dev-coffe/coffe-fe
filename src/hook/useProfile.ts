import {useCookies} from "react-cookie";
import {fetchWithRetry} from "../utils";
import type {GetProfileResponse, UpdateProfile} from "../model/profile.ts";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import useNotificationContext from "./useNotificationContext.ts";
import type {BaseResponse, ExtendedAxiosError, ResponseUploadFoto} from "../model";
import type {PayloadJWT} from "../model/auth.ts";
import {useState} from "react";

const useProfile = () => {
    const [cookies, _setCookie, removeCookie] = useCookies()
    const notification = useNotificationContext()
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);

    const getProfile = async (tokenParam?: string) => {
        const token = tokenParam || cookies?.token;
        if (!token) {
            return null;
        }
        try {
            const role = jwtDecode<PayloadJWT>(token)?.role;

            let url = '/api/user/profile';
            if (role === 'admin') url = '/api/admin/profile';
            else if (role === 'barista') url = '/api/barista/profile';

            const res = await fetchWithRetry<GetProfileResponse>({
                url,
                method: 'get',
                config: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            })
            if (res && res.data.success) {
                return res.data.data
            } else {
                console.error('Failed to fetch profile:', res?.data.message || 'Unknown error');
                return null;
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    if (errData.message.includes("token is expired")) {
                        notification.setNotification({
                            type: 'error',
                            message: 'Session expired. Please log in again.',
                            size: 'md',
                            duration: 3000,
                            mode: 'client',
                            isShow: true,
                        });
                    } else {
                        notification.setNotification({
                            type: 'error',
                            message: errData.message || 'Failed to fetch profile',
                            size: 'md',
                            duration: 3000,
                            mode: 'client',
                            isShow: true,
                        });
                    }
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

    const updateProfile = async (data: UpdateProfile) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        try {
            const token = cookies.token;
            if (data.photo instanceof File) {
                const uploadResult = await uploadProfilePhoto(data.photo);
                if (!uploadResult) {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Failed to upload profile photo.',
                        duration: 1000,
                        isShow: true,
                        size: 'md'
                    });
                    return null;
                }
                data.photo = uploadResult.data.file_path;
            } else if (data.preview.startsWith('profile')) {
                data.photo = data.preview; // Use existing photo path if preview is a valid path
            }

            const role = jwtDecode<PayloadJWT>(token)?.role;
            let url = '/api/user/profile';
            if (role === 'admin') url = '/api/admin/profile';
            else if (role === 'barista') url = '/api/barista/profile';

            const res = await fetchWithRetry<BaseResponse<null>>({
                url,
                method: 'put',
                body: data,
                config: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            });

            if (res && res.data.success) {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Profile updated successfully.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
                return res.data.data;
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: res?.data.message || 'Failed to update profile.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
                return null;
            }

        } catch (error) {
            console.error('Error updating profile:', error);
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
                            size: 'md'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to update profile.',
                            duration: 1000,
                            isShow: true,
                            size: 'md'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'md'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to add profile. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
            }
            return null
        } finally {
            setLoadingProgress(false);
        }
    }

    const uploadProfilePhoto = async (file: File) => {
        try {
            const dataForm = new FormData();
            dataForm.append('file', file);
            dataForm.append('module', 'profile')
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
                    message: 'Failed to upload profile photo.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
                return null;
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
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
                            size: 'md'
                        });
                        removeCookie('token')
                    } else {
                        notification.setNotification({
                            mode: 'dashboard',
                            type: 'error',
                            message: errData.message || 'Failed to upload profile photo.',
                            duration: 1000,
                            isShow: true,
                            size: 'md'
                        });
                    }
                } else {
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: 'Network error or server is down.',
                        duration: 1000,
                        isShow: true,
                        size: 'md'
                    });
                }
            } else {
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'error',
                    message: 'Failed to upload profile photo. Please try again later.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
            }
        }
    }

    return {
        getProfile,
        updateProfile
    }
}

export default useProfile;