import React from "react";
import {NavLink, Link} from "react-router";
import {useAuthContext} from "@/app/providers/AuthContext.ts";
import {useLogoutContext} from "@/app/providers/LogoutContext.ts";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import {
    HiHome,
    HiBookOpen,
    HiLocationMarker,
    HiShoppingCart,
    HiCreditCard,
    HiReceiptTax,
    HiLogout,
    HiViewGrid,
} from "react-icons/hi";

export interface ClientMobileNavProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ClientMobileNav: React.FC<ClientMobileNavProps> = ({isOpen, onClose}) => {
    const {auth} = useAuthContext();
    const {openLogoutModal} = useLogoutContext();

    if (!isOpen) return null;

    const navItemClass = ({isActive}: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
            isActive
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold"
                : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
        }`;

    return (
        <div className="fixed inset-0 z-[60] md:hidden animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Drawer */}
            <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                    {/* User Profile Header or Login Prompts */}
                    {auth.isAuth ? (
                        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center gap-3.5">
                            <UserAvatar src={auth.photo} name={auth.name} size="md" />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {auth.name}
                                </p>
                                <span className="text-xs uppercase font-semibold text-amber-600 dark:text-amber-400">
                                    {auth.role}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Link
                                to="/login"
                                onClick={onClose}
                                className="px-4 py-2.5 text-center text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                onClick={onClose}
                                className="px-4 py-2.5 text-center text-xs font-bold rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/20"
                            >
                                Join Free
                            </Link>
                        </div>
                    )}

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                        <NavLink to="/" end onClick={onClose} className={navItemClass}>
                            <HiHome className="text-lg text-amber-500" />
                            Home
                        </NavLink>
                        <NavLink to="/menu" onClick={onClose} className={navItemClass}>
                            <HiBookOpen className="text-lg text-amber-500" />
                            Catalog Menu
                        </NavLink>
                        <NavLink to="/location" onClick={onClose} className={navItemClass}>
                            <HiLocationMarker className="text-lg text-amber-500" />
                            Store Locations
                        </NavLink>

                        {auth.isAuth && (
                            <>
                                <div className="pt-3 pb-1">
                                    <p className="px-4 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                        Member Features
                                    </p>
                                </div>
                                <NavLink to="/my-cart" onClick={onClose} className={navItemClass}>
                                    <HiShoppingCart className="text-lg text-amber-500" />
                                    My Cart
                                </NavLink>
                                <NavLink to="/my-wallet" onClick={onClose} className={navItemClass}>
                                    <HiCreditCard className="text-lg text-amber-500" />
                                    Digital Wallet
                                </NavLink>
                                <NavLink to="/my-transaction" onClick={onClose} className={navItemClass}>
                                    <HiReceiptTax className="text-lg text-amber-500" />
                                    Order History
                                </NavLink>
                                {(auth.role === "admin" || auth.role === "barista") && (
                                    <Link
                                        to="/dashboard"
                                        onClick={onClose}
                                        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                    >
                                        <HiViewGrid className="text-lg" />
                                        Dashboard Panel
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </div>

                {/* Drawer Footer */}
                {auth.isAuth && (
                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => {
                                onClose();
                                openLogoutModal();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                            <HiLogout className="text-lg" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientMobileNav;
