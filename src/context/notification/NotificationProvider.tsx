import NotificationContext, {type Toast} from "./NotificationContext.ts";
import {useCallback, useState} from "react";

let toastCounter = 0;

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, "id">): string => {
        const id = `toast-${++toastCounter}`;
        setToasts(prev => [...prev, {...toast, id}]);

        if (toast.duration > 0) {
            setTimeout(() => removeToast(id), toast.duration);
        }
        return id;
    }, [removeToast]);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    const successNotificationClient = useCallback((message: string) => {
        addToast({type: "success", message, duration: 3000, mode: "client"});
    }, [addToast]);

    const errorNotificationClient = useCallback((message: string) => {
        addToast({type: "error", message, duration: 3000, mode: "client"});
    }, [addToast]);

    const warningNotificationClient = useCallback((message: string) => {
        addToast({type: "warning", message, duration: 3000, mode: "client"});
    }, [addToast]);

    const infoNotificationClient = useCallback((message: string) => {
        addToast({type: "info", message, duration: 3000, mode: "client"});
    }, [addToast]);

    const successNotificationDashboard = useCallback((message: string) => {
        addToast({type: "success", message, duration: 3000, mode: "dashboard"});
    }, [addToast]);

    const errorNotificationDashboard = useCallback((message: string) => {
        addToast({type: "error", message, duration: 3000, mode: "dashboard"});
    }, [addToast]);

    return (
        <NotificationContext.Provider value={{
            toasts, addToast, removeToast, clearToasts,
            successNotificationClient, errorNotificationClient,
            warningNotificationClient, infoNotificationClient,
            successNotificationDashboard, errorNotificationDashboard,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationProvider;