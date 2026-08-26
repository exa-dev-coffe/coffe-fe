import {createContext, useContext} from "react";

export interface PermissionAction {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface AuthUser {
    userId?: number;
    name?: string;
    email?: string;
    role?: string;
    roleId?: number;
    photo?: string;
    permissions?: Record<string, PermissionAction>;
}

export interface AuthState extends AuthUser {
    isAuth: boolean;
    loading: boolean;
}

export interface AuthContextType {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
    setAuthData: (data: {
        userId?: number;
        name: string;
        email: string;
        role: string;
        roleId?: number;
        photo?: string;
        permissions?: Record<string, PermissionAction>;
    }) => void;
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
