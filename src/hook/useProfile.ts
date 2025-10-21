import {fetchWithRetry} from "../utils";
import type {GetProfileResponse, UpdateProfile} from "../model/profile.ts";
import axios from "axios";
import useNotificationContext from "./useNotificationContext.ts";
import type {BaseResponse, ExtendedAxiosError, ResponseUploadFoto} from "../model";
import {useState} from "react";
import cookie from "../utils/cookie.ts";
import type {AuthResponse} from "../model/auth.ts";

const useProfile = () => {
    const notification = useNotificationContext()
    const [loadingProgress, setLoadingProgress] = useState<boolean>(false);

    const getProfile = async () => {
        try {
            const url = '/api/1.0/me';

            const res = await fetchWithRetry<GetProfileResponse>({
                url,
                method: 'get',
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
                    if (errData.message.includes("Refresh token tidak ditemukan")) return
                    notification.setNotification({
                        type: 'error',
                        message: errData.message || 'Failed to fetch profile',
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

    const updateProfile = async (data: UpdateProfile) => {
        if (loadingProgress) return;
        setLoadingProgress(true);
        let isPhotoUploaded = false;
        try {
            if (data.photo instanceof File) {
                const uploadResult = await uploadProfilePhoto(data.photo);
                isPhotoUploaded = true;
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
                data.photo = uploadResult.data.url;
            } else if (data.preview.startsWith('https')) {
                data.photo = data.preview; // Use existing photo path if preview is a valid path
            }

            const url = '/api/1.0/update-profile';

            const res = await fetchWithRetry<AuthResponse>({
                url,
                method: 'patch',
                body: data,
                config: {
                    withCredentials: true
                }
            });

            if (res && res.data.success) {
                if (data.photoBefore && data.photoBefore !== data.photo) {
                    deleteProfilePhoto(data.photoBefore);
                }
                notification.setNotification({
                    mode: 'dashboard',
                    type: 'success',
                    message: 'Profile updated successfully.',
                    duration: 1000,
                    isShow: true,
                    size: 'md'
                });
                cookie.set("token", res.data.data.accessToken, 1);
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
                if (data.photo && typeof data.photo === 'string' && data.photo.startsWith('https') && isPhotoUploaded && data.photo !== data.preview) {
                    deleteProfilePhoto(data.photo) // Delete uploaded photo if profile update fails
                }
                if (error.response && error.response.data) {
                    const errData = (error as ExtendedAxiosError).response?.data || {message: 'Unknown error'};
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to update profile.',
                        duration: 1000,
                        isShow: true,
                        size: 'md'
                    });
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
            const resUpload = await fetchWithRetry<ResponseUploadFoto>({
                url: "/api/1.0/upload/upload-profile",
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
                    notification.setNotification({
                        mode: 'dashboard',
                        type: 'error',
                        message: errData.message || 'Failed to upload profile photo.',
                        duration: 1000,
                        isShow: true,
                        size: 'md'
                    });
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

    const deleteProfilePhoto = async (url: string) => {
        try {
            const resDelete = await fetchWithRetry<BaseResponse<null>>({
                url: `/api/1.0/upload/delete-profile?url=${encodeURIComponent(url)}`,
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

    return {
        getProfile,
        updateProfile
    }
}

export default useProfile;