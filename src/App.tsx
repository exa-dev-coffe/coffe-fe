import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";
import ModalNotification from "./component/ui/ModalNotification.tsx";
import {CookiesProvider} from "react-cookie";

function App() {

    return (
        <>
            <CookiesProvider>
                <NotificationProvider>
                    <ModalNotification/>
                    <RouterProvider router={router}/>
                </NotificationProvider>
            </CookiesProvider>
        </>
    )
}

export default App
