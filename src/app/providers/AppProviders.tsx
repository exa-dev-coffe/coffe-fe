import React from "react";
import ThemeProvider from "@/app/providers/ThemeProvider.tsx";
import NotificationProvider from "@/app/providers/NotificationProvider.tsx";
import AuthProvider from "@/app/providers/AuthProvider.tsx";
import CartProvider from "@/app/providers/CartProvider.tsx";
import LogoutProvider from "@/app/providers/LogoutProvider.tsx";
import ToastContainer from "@/components/shared/ToastContainer.tsx";
import LogoutModal from "@/components/shared/LogoutModal.tsx";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({children}) => {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <CartProvider>
                    <AuthProvider>
                        <LogoutProvider>
                            <ToastContainer />
                            <LogoutModal />
                            {children}
                        </LogoutProvider>
                    </AuthProvider>
                </CartProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
};

export default AppProviders;
