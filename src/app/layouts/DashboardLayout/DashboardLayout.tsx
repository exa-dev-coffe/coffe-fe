import React, {useState} from "react";
import {Outlet} from "react-router";
import DashboardSidebar from "@/app/layouts/DashboardLayout/DashboardSidebar.tsx";
import DashboardHeader from "@/app/layouts/DashboardLayout/DashboardHeader.tsx";

export const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
            {/* Sidebar */}
            <DashboardSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
                <DashboardHeader
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto page-fade-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
