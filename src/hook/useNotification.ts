import {useContext} from "react";
import NotificationContext from "../context/notification/NotificationContext.ts";

const useNotification = () => {
    const nofitication = useContext(NotificationContext)
    if (!nofitication) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return nofitication;
}

export default useNotification;