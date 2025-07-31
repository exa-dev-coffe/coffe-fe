import {useCookies} from "react-cookie";
import {fetchWithRetry} from "../utils";
import type {GetProfileResponse} from "../model/profile.ts";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import useNotificationContext from "./useNotificationContext.ts";
import type {ExtendedAxiosError} from "../model";
import type {PayloadJWT} from "../model/auth.ts";

const useProfile = () => {
    const [cookies] = useCookies()
    const notification = useNotificationContext();

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

    return {
        getProfile,
    }
}

export default useProfile;