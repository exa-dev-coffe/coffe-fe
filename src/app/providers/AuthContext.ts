import {createContext, useContext} from "react";

export interface AuthUser {
    name?: string;
    email?: string;
    role?: string;
    photo?: string;
}

export interface AuthState extends AuthUser {
    isAuth: boolean;
    loading: boolean;
}

export interface AuthContextType {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
    setAuthData: (data: { name: string; email: string; role: string; photo?: string }) => void;
    setNotAuth: () => void;
    refetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
