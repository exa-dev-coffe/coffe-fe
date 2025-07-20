import {useContext} from "react";
import AuthContext from "../context/auth/AuthContext.ts";

const useAuthContext = () => {
    const auth = useContext(AuthContext)
    if (!auth) {
        throw new Error("useAuthContext must be used within a AuthProvider");
    }
    return auth;
}

export default useAuthContext;