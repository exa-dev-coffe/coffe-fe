import React from "react";
import {Navigate} from "react-router";
import {useAuthContext} from "@/app/providers/AuthContext.ts";
import {usePermission} from "@/features/auth/hooks/usePermission.ts";

export interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[];
    feature?: string;
    action?: "view" | "create" | "edit" | "delete";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children, roles, feature, action = "view"}) => {
    const {auth} = useAuthContext();
    const {isAdmin, can} = usePermission();

    if (!auth.isAuth) {
        return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
        return <>{children}</>;
    }

    if (feature) {
        if (!can(feature, action)) {
            return <Navigate to="/403" replace />;
        }
    } else if (roles && roles.length > 0) {
        if (!auth.role || !roles.includes(auth.role)) {
            return <Navigate to="/403" replace />;
        }
    }

    return <>{children}</>;
};

export const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const {auth} = useAuthContext();

    if (auth.isAuth) {
        if (auth.role === "admin" || auth.role === "barista") {
            return <Navigate to="/dashboard/menu" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
