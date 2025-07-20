import {createContext} from "react";

type CummonAuth = {
    email: string;
    name: string;
    role: string;
    photo: string;
}

type isAuthenticated = CummonAuth & {
    isAuth: true;
}

type isNotAuthenticated = {
    isAuth: false;
}

export type AuthData = isAuthenticated | isNotAuthenticated;

interface AuthContext {
    auth: AuthData;
    setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
}

const AuthContext = createContext<AuthContext | null>(null);

export default AuthContext;