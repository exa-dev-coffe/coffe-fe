import Modal from "./ui/Modal.tsx";
import useLogoutContext from "../hook/useLogoutContext.ts";
import {fetchWithRetry} from "../utils";
import {useCookies} from "react-cookie";
import useNotificationContext from "../hook/useNotificationContext.ts";

const LogOut = () => {

    const logout = useLogoutContext()
    const [cookies, _setCookie, removeCookie] = useCookies();
    const notification = useNotificationContext()

    const handleLogout = async () => {
        try {
            await fetchWithRetry({
                url: "/api/logout",
                method: "post",
                config: {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${cookies.token}`,
                    },
                },
            })
            removeCookie("token");
        } catch (error) {
            console.error("Logout error:", error);
            notification.setNotification({
                type: "error",
                message: "Failed to logout",
                size: "md",
                duration: 3000,
                mode: "client",
                isShow: true,
            });
        }
        logout.setLogout({show: false});
    }

    return (
        <Modal handleClose={() => logout.setLogout({show: false})} show={logout.logout.show} size={'md'}
               title={"Confirm Logout"}>
            <div className="flex flex-col items-center justify-center gap-4">
                <h4 className="text-3xl font-semibold mt-4">Are you sure you want to log out?</h4>
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