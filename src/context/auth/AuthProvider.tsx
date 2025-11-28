import {useEffect, useState} from "react";
import AuthContext, {type AuthData} from "./AuthContext.ts";
import useProfile from "../../hook/useProfile.ts";
import useCartContext from "../../hook/useCartContext.ts";
import type {CartData} from "../cart/CartContext.ts";
import Cookie from "../../utils/cookie.ts";
import LoadingScreen from "../../component/LoadingScreen.tsx";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [auth, setAuth] = useState<AuthData>({
        isAuth: false,
        loading: true,
    });
    const cart = useCartContext()
    const {getProfile} = useProfile();

    useEffect(
        () => {
            const fetchProfile = async () => {
                const profile = await getProfile();
                if (profile) {
                    setAuth({
                        isAuth: true,
                        loading: false,
                        name: profile.fullName,
                        email: profile.email,
                        role: profile.role,
                        photo: profile.photo || '',
                    });
                } else {
                    setAuth({
                        isAuth: false,
                        loading: false,
                    });
                    Cookie.erase('token');
                }
            };
            fetchProfile();
            const cookieCart = Cookie.get("cart");
            if (cookieCart) {
                const data: CartData = JSON.parse(cookieCart);
                cart.setCart({
                    tableId: data.tableId || 0,
                    tableName: data.tableName || '',
                    orderFor: data.orderFor || '',
                    datas: data.datas || [],
                });
            }
        },
        []
    )

    return (
        <AuthContext.Provider value={{auth, setAuth}}>
            {
                true ? <LoadingScreen/> : children
            }
        </AuthContext.Provider>
    );
}

export default AuthProvider;