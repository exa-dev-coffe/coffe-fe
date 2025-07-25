import {useEffect, useState} from "react";
import AuthContext, {type AuthData} from "./AuthContext.ts";
import useProfile from "../../hook/useProfile.ts";
import {useCookies} from "react-cookie";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthData>({
        isAuth: false,
        loading: true,
    });
    const {getProfile} = useProfile();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_cookies, _setCookie, removeCookie] = useCookies()

    useEffect(
        () => {
            const fetchProfile = async () => {
                const profile = await getProfile();
                if (profile) {
                    setAuth({
                        isAuth: true,
                        loading: false,
                        name: profile.full_name,
                        email: profile.email,
                        role: profile.role,
                        photo: profile.photo || '',
                    });
                } else {
                    setAuth({
                        isAuth: false,
                        loading: false,
                    });
                    removeCookie('token');
                }
            };
            fetchProfile();
        },
        []
    )

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;