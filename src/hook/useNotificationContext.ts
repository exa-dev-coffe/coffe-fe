import {useContext} from "react";
import NotificationContext from "../context/notification/NotificationContext.ts";

const useNotificationContext = () => {
    const notificationContext = useContext(NotificationContext)
    if (!notificationContext) {
        throw new Error("useNotificationContext must be used within a NotificationProvider");
    }

    const errorNotificationClient = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            type: "error",
            message,
            size: size,
            duration: 3000,
            mode: "client",
            isShow: true,
        });
    }

    const errorNotificationDashboard = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            type: "error",
            message,
            size: size,
            duration: 3000,
            mode: "dashboard",
            isShow: true,
        });
    }

    const infoNotificationClient = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            type: "info",
            message,
            size: size,
            duration: 3000,
            mode: "client",
            isShow: true,
        });
    }

    const successNotificationClient = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            type: "success",
            message,
            size: size,
            duration: 3000,
            mode: "client",
            isShow: true,
        })
    }

    const successNotificationDashboard = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            mode: "dashboard",
            type: "success",
            message,
            size: size,
            duration: 3000,
            isShow: true,
        })
    }

    const warningNotificationClient = (message: string, size: "xs" | "sm" | "md" | "lg" = "md") => {
        notificationContext.setNotification({
            type: "warning",
            message,
            size: size,
            duration: 3000,
            mode: "client",
            isShow: true,
        });
    }

    const closeNotificationClient = () => {
        notificationContext.setNotification({
            isShow: false,
        });
    }

    return {
        ...notificationContext.notification,
        warningNotificationClient,
        infoNotificationClient,
        errorNotificationDashboard,
        successNotificationDashboard,
        successNotificationClient,
        closeNotificationClient,
        errorNotificationClient
    };
}

export default useNotificationContext;