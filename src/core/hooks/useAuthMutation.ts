import { useMutation } from "@tanstack/react-query";
import { fetchWithRetry } from "@/core/api/client.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import Cookie from "@/core/utils/cookie.ts";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import { useCartContext } from "@/app/providers/CartContext.ts";
import { useNotificationContext } from "@/app/providers/NotificationContext.ts";

export const useLogoutMutation = () => {
    const { setNotAuth } = useAuthContext();
    const { resetCart } = useCartContext();
    const { errorNotificationClient } = useNotificationContext();

    return useMutation({
        mutationFn: async () => {
            await fetchWithRetry({
                url: ENDPOINTS.AUTH_LOGOUT,
                method: "post",
                config: { withCredentials: true },
            });
            return true;
        },
        onSuccess: () => {
            Cookie.erase("token");
            setNotAuth();
            resetCart();
            window.location.href = "/login";
        },
        onError: (err) => {
            console.error("Logout error:", err);
            errorNotificationClient("Failed to logout cleanly from server.");
            // Still clear local state just in case
            Cookie.erase("token");
            setNotAuth();
            resetCart();
            window.location.href = "/login";
        }
    });
};
