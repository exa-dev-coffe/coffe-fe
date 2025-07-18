import {createContext} from "react";

type CummonNotification = {
    size: "xs" | "sm" | "md" | "lg";
    mode: "dashboard" | "client";
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration: number;
}

type VisibleNotification = CummonNotification & {
    isShow: true;
}

type HiddenNotification = {
    isShow: false;
}

export type NotificationData = VisibleNotification | HiddenNotification;

interface NotificationContext {
    notification: NotificationData;
    setNotification: React.Dispatch<React.SetStateAction<NotificationData>>;
}

const NotificationContext = createContext<NotificationContext | null>(null);

export default NotificationContext;