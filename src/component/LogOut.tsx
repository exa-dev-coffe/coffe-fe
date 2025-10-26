import Modal from "./ui/Modal.tsx";
import useLogoutContext from "../hook/useLogoutContext.ts";
import {fetchWithRetry} from "../utils";
import useNotificationContext from "../hook/useNotificationContext.ts";
import {useRef} from "react";
import useAuthContext from "../hook/useAuthContext.ts";
import useCartContext from "../hook/useCartContext.ts";
import Cookie from "../utils/cookie.ts";

const LogOut = () => {

    const logout = useLogoutContext()
    const notification = useNotificationContext()
    const loading = useRef(false);
    const auth = useAuthContext()
    const cart = useCartContext()

    const handleLogout = async () => {
        if (loading.current) return; // Prevent multiple clicks
        loading.current = true; // Set loading to true to prevent further clicks
        try {
            await fetchWithRetry({
                url: "/api/1.0/auth/logout",
                method: "post",
                config: {
                    withCredentials: true,
                },
            })
            Cookie.erase("token");
            auth.setNotAuth();
            cart.resetCart();
        } catch (error) {
            console.error("Logout error:", error);
            notification.errorNotificationClient("Failed to logout", "md",);
        } finally {
            loading.current = false; // Reset loading state
            window.location.href = "/login";
        }
        logout.setLogout({show: false});
    }

    return (
        <Modal handleClose={() => logout.setLogout({show: false})} show={logout.logout.show} size={'md'}
               title={"Confirm Logout"}>
            <div className="flex flex-col items-center justify-center gap-4">
                <h4 className="sm:text-3xl text-lg font-semibold mt-4">Are you sure you want to log out?</h4>
                <div className="flex gap-4 p-10">
                    <button
                        onClick={() => logout.setLogout({show: false})}
                        className="cursor-pointer btn-primary px-5 py-2 rounded-lg text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer text-white px-5 py-2 rounded-lg btn-danger"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default LogOut;