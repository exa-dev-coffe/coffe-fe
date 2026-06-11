import {createContext} from "react";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastMode = "dashboard" | "client";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
    mode: ToastMode;
}

export interface NotificationContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => string;
    removeToast: (id: string) => void;
    clearToasts: () => void;

    successNotificationClient: (message: string) => void;
    errorNotificationClient: (message: string) => void;
    warningNotificationClient: (message: string) => void;
    infoNotificationClient: (message: string) => void;
    successNotificationDashboard: (message: string) => void;
    errorNotificationDashboard: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export default NotificationContext;