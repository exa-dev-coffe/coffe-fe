import './App.css'
import {RouterProvider} from "react-router";
import router from "./router";
import NotificationProvider from "./context/notification/NotificationProvider.tsx";

function App() {

    return (
        <>
            <NotificationProvider>
                <RouterProvider router={router}/>
            </NotificationProvider>
        </>
    )
}

export default App
