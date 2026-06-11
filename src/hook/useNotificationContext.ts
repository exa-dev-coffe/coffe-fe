import {useContext} from "react";
import NotificationContext from "../context/notification/NotificationContext.ts";

const useNotificationContext = () => {
    const ctx = useContext(NotificationContext)
    if (!ctx) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }

    return ctx;
}

export default useNotificationContext;