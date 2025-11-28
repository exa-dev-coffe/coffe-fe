import {useEffect} from "react";
import axios from "axios";
import useNotificationContext from "../hook/useNotificationContext.ts";
import type {ExtendedAxiosError} from "../model";
import {useNavigate} from "react-router";
import cookie from "../utils/cookie.ts";
import type {AuthResponse} from "../model/auth.ts";
import useProfile from "../hook/useProfile.ts";
import useAuthContext from "../hook/useAuthContext.ts";
import useCartContext from "../hook/useCartContext.ts";
import Config from "../config/config.ts";

const ButtonSignInGoogle = () => {
    const notification = useNotificationContext();
    const navigate = useNavigate();
    const auth = useAuthContext();
    const cart = useCartContext();
    const {getProfile} = useProfile();

    function handleRedirectGoogle() {
        window.location.href = `${Config.BASE_URL}/api/1.0/auth/google`;
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token_temp = urlParams.get('token_temp');
        const error = urlParams.get('error');

        if (error) {
            navigate('/login', {replace: true});
            notification.errorNotificationClient(decodeURIComponent(error), "md");
            return;
        }

        const autoLogin = async () => {
            // kirim ke backend
            try {
                const response = await axios.post<AuthResponse>(`${Config.BASE_URL}/api/1.0/auth/google/login`, {
                    tokenTemp: token_temp
                }, {
                    headers: {},
                    withCredentials: true,
                });
                if (response && response.data.success) {
                    cookie.set(
                        "token",
                        response.data.data.accessToken, 1
                    )
                    const profile = await getProfile();
                    if (!profile) {
                        notification.errorNotificationClient("Failed to fetch profile after login", "md",);
                        return;
                    }
                    auth.setAuthData({
                        role: profile.role,
                        name: profile.fullName,
                        email: profile.email,
                        photo: profile.photo || '',
                    })

                    cart.setOrderFor(profile.fullName)

                    if (["admin", "barista"].includes(profile.role)) {
                        navigate("/dashboard", {replace: true});
                    } else {
                        navigate("/", {replace: true});
                    }
                } else {
                    notification.errorNotificationClient(response?.data.message || "Login failed", "md",)
                }
            } catch (error) {
                console.error("Auto login error:", error);
                if (axios.isAxiosError(error)) {
                    if ((error as ExtendedAxiosError).response?.status === 401) {
                        notification.errorNotificationClient("Unauthorized access. Please login again.", "md");
                        navigate('/login', {replace: true});
                        return;
                    }
                    const responseError = (error as ExtendedAxiosError).response?.data || {message: "Auto login failed"};
                    notification.errorNotificationClient(responseError.message, "md");
                } else {
                    notification.errorNotificationClient("An unexpected error occurred", "md",);
                }
            }
        }
        if (token_temp) {
            autoLogin();
        }
    }, []);


    return (

        <button
            type="button"
            onClick={handleRedirectGoogle}
            className="flex items-center justify-center gap-2 w-full px-4 py-2
        border border-gray-300 rounded-lg
        hover:bg-gray-100 active:bg-gray-200
        transition-colors duration-200"
        >
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
                alt="Google Logo"
                className="w-5 h-5"
            />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
        </button>

    );
};

export default ButtonSignInGoogle;
