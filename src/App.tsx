import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";
import ModalNotification from "./component/ModalNotification.tsx";
import {CookiesProvider} from "react-cookie";
import AuthProvider from "./context/auth/AuthProvider.tsx";
import LogoutProvider from "./context/logout/LogoutProvider.tsx";
import LogOut from "./component/LogOut.tsx";
import CartProvider from "./context/cart/CartProvider.tsx";

function App() {

    return (
        <>
            <CookiesProvider>
                <CartProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <LogoutProvider>
                                <LogOut/>
                                <ModalNotification/>
                                <RouterProvider router={router}/>
                            </LogoutProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </CartProvider>
            </CookiesProvider>
        </>
    )
}

export default App
