import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";
import ModalNotification from "./component/ui/ModalNotification.tsx";

function App() {

    return (
        <>
            <NotificationProvider>
                <ModalNotification/>
                <RouterProvider router={router}/>
            </NotificationProvider>
        </>
    )
}

export default App
