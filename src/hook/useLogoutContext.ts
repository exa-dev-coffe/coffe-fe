import {useContext} from "react";
import LogoutContext from "../context/logout/LogoutContext.ts";

const useLogoutContext = () => {
    const logout = useContext(LogoutContext)
    if (!logout) {
        throw new Error("useLogoutContext must be used within a AuthProvider");
    }
    return logout;
}

export default useLogoutContext;