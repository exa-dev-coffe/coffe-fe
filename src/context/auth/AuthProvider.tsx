import {useEffect, useState} from "react";
import AuthContext, {type AuthData} from "./AuthContext.ts";
import useProfile from "../../hook/useProfile.ts";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthData>({
        isAuth: false,
        loading: true,
    });
    const cart = useCartContext()
    const {getProfile} = useProfile();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_cookies, setCookie, removeCookie] = useCookies()

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

    useEffect(() => {
        setCookie(
            'cart',
            JSON.stringify(cart.cart),
            {
                path: '/',
                sameSite: true,
                expires: new Date(Date.now() + 3600 * 1000), // 1 hour
                secure: true, // Use secure cookies in production
            }
        )
    }, [cart.cart]);

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthProvider;