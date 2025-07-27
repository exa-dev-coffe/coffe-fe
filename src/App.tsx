import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";
import ModalNotification from "./component/ModalNotification.tsx";
import {CookiesProvider} from "react-cookie";
import AuthProvider from "./context/auth/AuthProvider.tsx";

function App() {

    return (
        <>
            <CookiesProvider>
                <NotificationProvider>
                    <AuthProvider>
                        <ModalNotification/>
                        <RouterProvider router={router}/>
                    </AuthProvider>
                </NotificationProvider>
            </CookiesProvider>
        </>
    )
}

export default App
