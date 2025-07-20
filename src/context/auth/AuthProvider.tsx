import {useState} from "react";
import AuthContext, {type AuthData} from "./AuthContext.ts";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthData>({
        isAuth: false,
    });

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;