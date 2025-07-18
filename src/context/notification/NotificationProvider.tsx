import NotificationContext, {type NotificationData} from "./NotificationContext.ts";
import {useState} from "react";

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [notification, setNotification] = useState<NotificationData>({
        isShow: false,
    });

    return (
        <NotificationContext.Provider value={{notification, setNotification}}>
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationProvider;