import {createContext, useContext} from "react";

export interface LogoutState {
    show: boolean;
}

export interface LogoutContextType {
    logout: LogoutState;
    setLogout: React.Dispatch<React.SetStateAction<LogoutState>>;
    openLogoutModal: () => void;
    closeLogoutModal: () => void;
}

export const LogoutContext = createContext<LogoutContextType | null>(null);

export const useLogoutContext = (): LogoutContextType => {
    const context = useContext(LogoutContext);
    if (!context) {
        throw new Error("useLogoutContext must be used within a LogoutProvider");
    }
    return context;
};

export default LogoutContext;
