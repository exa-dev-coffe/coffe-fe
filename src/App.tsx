import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";
import ModalNotification from "./component/ModalNotification.tsx";
import AuthProvider from "./context/auth/AuthProvider.tsx";
import LogoutProvider from "./context/logout/LogoutProvider.tsx";
import LogOut from "./component/LogOut.tsx";
import CartProvider from "./context/cart/CartProvider.tsx";
import {useEffect} from "react";
import AOS from "aos";
import 'aos/dist/aos.css';


function App() {

    useEffect(() => {
        AOS.init()
    }, []);

    return (
        <>
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
        </>
    )
}

export default App
