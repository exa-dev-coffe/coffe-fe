import React, {useCallback, useState} from "react";
import NotificationContext, {type Toast, type ToastType, type ToastMode} from "@/app/providers/NotificationContext.ts";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback(
        ({type, message, duration = 4000, mode = "client"}: Omit<Toast, "id">) => {
            const id = Math.random().toString(36).substring(7);
            const newToast: Toast = {id, type, message, duration, mode};
            setToasts((prev) => [...prev, newToast]);

            if (duration > 0) {
                setTimeout(() => {
                    removeToast(id);
                }, duration);
            }
            return id;
        },
        [removeToast]
    );

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const notify = useCallback(
        (type: ToastType, message: string, mode: ToastMode) => {
            addToast({type, message, mode});
        },
        [addToast]
    );

    const successNotificationClient = useCallback(
        (msg: string) => notify("success", msg, "client"),
        [notify]
    );
    const errorNotificationClient = useCallback(
        (msg: string) => notify("error", msg, "client"),
        [notify]
    );
    const warningNotificationClient = useCallback(
        (msg: string) => notify("warning", msg, "client"),
        [notify]
    );
    const infoNotificationClient = useCallback(
        (msg: string) => notify("info", msg, "client"),
        [notify]
    );
    const successNotificationDashboard = useCallback(
        (msg: string) => notify("success", msg, "dashboard"),
        [notify]
    );
    const errorNotificationDashboard = useCallback(
        (msg: string) => notify("error", msg, "dashboard"),
        [notify]
    );

    return (
        <NotificationContext.Provider
            value={{
                toasts,
                addToast,
                removeToast,
                clearToasts,
                successNotificationClient,
                errorNotificationClient,
                warningNotificationClient,
                infoNotificationClient,
                successNotificationDashboard,
                errorNotificationDashboard,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
