import {createContext} from "react";

export type LogoutData = {
    show: boolean;
}

interface LogoutContext {
    logout: LogoutData;
    setLogout: React.Dispatch<React.SetStateAction<LogoutData>>;
}

const LogoutContext = createContext<LogoutContext | null>(null);

export default LogoutContext;