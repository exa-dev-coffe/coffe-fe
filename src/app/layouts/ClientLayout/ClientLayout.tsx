import React, {useState} from "react";
import {Outlet} from "react-router";
import ClientNavbar from "@/app/layouts/ClientLayout/ClientNavbar.tsx";
import ClientMobileNav from "@/app/layouts/ClientLayout/ClientMobileNav.tsx";
import ClientFooter from "@/app/layouts/ClientLayout/ClientFooter.tsx";

export const ClientLayout: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <ClientNavbar
                mobileMenuOpen={mobileMenuOpen}
                onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
            <ClientMobileNav
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            />

            <main className="flex-1 flex flex-col page-fade-enter">
                <Outlet />
            </main>

            <ClientFooter />
        </div>
    );
};

export default ClientLayout;
