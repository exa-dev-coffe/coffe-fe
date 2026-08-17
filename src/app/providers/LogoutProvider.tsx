import React, {useState, useCallback} from "react";
import LogoutContext, {type LogoutState} from "@/app/providers/LogoutContext.ts";

export const LogoutProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [logout, setLogout] = useState<LogoutState>({show: false});

    const openLogoutModal = useCallback(() => {
        setLogout({show: true});
    }, []);

    const closeLogoutModal = useCallback(() => {
        setLogout({show: false});
    }, []);

    return (
        <LogoutContext.Provider value={{logout, setLogout, openLogoutModal, closeLogoutModal}}>
            {children}
        </LogoutContext.Provider>
    );
};

export default LogoutProvider;
