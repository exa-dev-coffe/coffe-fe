import React from "react";
import {NavLink, Link} from "react-router";
import IconLogo from "@/assets/images/icon.png";
import {useAuthContext} from "@/app/providers/AuthContext.ts";
import {useLogoutContext} from "@/app/providers/LogoutContext.ts";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import {DASHBOARD_NAV_ITEMS} from "@/app/layouts/DashboardLayout/dashboardNav.config.ts";
import {HiOutlineLogout, HiOutlineArrowLeft} from "react-icons/hi";

export interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({isOpen, onClose}) => {
    const {auth} = useAuthContext();
    const {openLogoutModal} = useLogoutContext();

    const allowedNavItems = DASHBOARD_NAV_ITEMS.filter((item) =>
        item.roles.includes((auth.role as "admin" | "barista") || "barista")
    );

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Aside */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Brand Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <Link to="/dashboard/menu" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 p-1.5 flex items-center justify-center border border-amber-500/20 shadow-sm transition-transform group-hover:scale-105">
                            <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                                DISKUSI <span className="text-amber-600 dark:text-amber-400">PANEL</span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block -mt-0.5">
                                {auth.role === "admin" ? "Master Admin" : "Barista Station"}
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
                    <div className="px-3 pb-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                            Management Suite
                        </p>
                    </div>

                    {allowedNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onClose}
                                className={({isActive}) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                                        isActive
                                            ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-500/20 shadow-sm"
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                    }`
                                }
                            >
                                <Icon className="text-lg shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        );
                    })}

                    <div className="pt-4 px-3 pb-2">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                            Storefront
                        </p>
                    </div>

                    <Link
                        to="/"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <HiOutlineArrowLeft className="text-lg shrink-0" />
                        <span>Visit Storefront</span>
                    </Link>
                </div>

                {/* Profile Card & Logout */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <UserAvatar src={auth.photo} name={auth.name} size="sm" />
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {auth.name}
                                </p>
                                <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400">
                                    {auth.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={openLogoutModal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 transition-colors cursor-pointer"
                    >
                        <HiOutlineLogout className="text-base" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
