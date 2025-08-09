import Modal from "./ui/Modal.tsx";
import useLogoutContext from "../hook/useLogoutContext.ts";
import useAuthContext from "../hook/useAuthContext.ts";

const LogOut = () => {

    const logout = useLogoutContext()
    const auth = useAuthContext()

    const handleLogout = () => {
        logout.setLogout({show: false});
        auth.setAuth({
            isAuth: false,
            loading: false,
        });
    }

    return (
        <Modal handleClose={() => logout.setLogout({show: false})} show={logout.logout.show} size={'md'}
               title={"Confirm Logout"}>
            <div className="flex flex-col items-center justify-center gap-4">
                <h4 className="text-3xl mt-4">Are you sure you want to log out?</h4>
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