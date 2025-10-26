import {useContext} from "react";
import AuthContext from "../context/auth/AuthContext.ts";

const useAuthContext = () => {
    const auth = useContext(AuthContext)
    if (!auth) {
        throw new Error("useAuthContext must be used within a AuthProvider");
    }

    const setNotAuth = () => {
        auth.setAuth({
            loading: false,
            isAuth: false,
        });
    }

    const setAuthData = ({role, name, email, photo}: { role: string, name: string, email: string, photo: string }) => {
        auth.setAuth({
            role,
            name,
            email,
            photo,
            loading: false,
            isAuth: true,
        });
    }


    return {
        ...auth.auth,
        setNotAuth,
        setAuthData,
    };
}

export default useAuthContext;