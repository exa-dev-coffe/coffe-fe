import {useContext} from "react";
import NotificationContext from "../context/notification/NotificationContext.ts";

const useNotificationContext = () => {
    const nofitication = useContext(NotificationContext)
    if (!nofitication) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }
    return nofitication;
}

export default useNotificationContext;