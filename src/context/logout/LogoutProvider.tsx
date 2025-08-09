import LogoutContext, {type LogoutData} from "./LogoutContext.ts";
import {useState} from "react";

const LogoutProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [logout, setLogout] = useState<LogoutData>({
        show: false,
    });

    return (
        <LogoutContext.Provider value={{logout, setLogout}}>
            {children}
        </LogoutContext.Provider>
    );
}

export default LogoutProvider;