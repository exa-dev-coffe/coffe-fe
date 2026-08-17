import React, {useState, useRef, useEffect} from "react";
import {Link, NavLink, useLocation} from "react-router";
import IconLogo from "@/assets/images/icon.png";
import {useAuthContext} from "@/app/providers/AuthContext.ts";
import {useCartContext} from "@/app/providers/CartContext.ts";
import {useLogoutContext} from "@/app/providers/LogoutContext.ts";
import ThemeToggle from "@/components/shared/ThemeToggle.tsx";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import {
    HiMenu,
    HiX,
    HiOutlineShoppingCart,
    HiOutlineCreditCard,
    HiOutlineDocumentText,
    HiOutlineLogout,
    HiOutlineViewGrid,
} from "react-icons/hi";

export interface ClientNavbarProps {
    onToggleMobileMenu: () => void;
    mobileMenuOpen: boolean;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({
    onToggleMobileMenu,
    mobileMenuOpen,
}) => {
    const {auth} = useAuthContext();
    const {totalItemsCount} = useCartContext();
    const {openLogoutModal} = useLogoutContext();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const isAuthPage = [
        "/login",
        "/register",
        "/forget-password",
        "/reset-password",
    ].includes(location.pathname);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinkClass = ({isActive}: { isActive: boolean }) =>
        `text-sm font-semibold transition-all duration-200 px-3.5 py-1.5 rounded-full ${
            isActive
                ? "text-amber-700 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-400/15 shadow-sm"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60"
        }`;

    return (
        <header className="sticky top-0 z-50 glass-nav transition-colors">
            <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                {/* Brand Logo */}
                <div className="flex items-center gap-4 sm:gap-10">
                    <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 p-1.5 flex items-center justify-center border border-amber-500/20 transition-transform group-hover:scale-105 shadow-sm">
                            <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                        </div>
                        <div className="hidden min-[400px]:block">
                            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                                DISKUSI <span className="text-amber-600 dark:text-amber-400">COFFEE</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block -mt-1">
                                Artisan Roastery
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-slate-200/60 dark:border-slate-700/60">
                        <NavLink to="/" end className={navLinkClass}>
                            Home
                        </NavLink>
                        <NavLink to="/menu" className={navLinkClass}>
                            Menu
                        </NavLink>
                        <NavLink to="/location" className={navLinkClass}>
                            Locations
                        </NavLink>
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Cart Icon Link */}
                    {auth.isAuth && (
                        <Link
                            to="/my-cart"
                            className="relative p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all duration-200 shadow-sm"
                            aria-label="View Cart"
                        >
                            <HiOutlineShoppingCart className="w-5 h-5" />
                            {totalItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                                    {totalItemsCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* User Profile Dropdown */}
                    {auth.isAuth ? (
                        <div ref={dropdownRef} className="relative hidden md:block">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm"
                            >
                                <UserAvatar src={auth.photo} name={auth.name} size="sm" />
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                                        {auth.name?.split(" ")[0]}
                                    </p>
                                    <span className="text-[10px] uppercase font-semibold text-amber-600 dark:text-amber-400 block -mt-0.5">
                                        {auth.role}
                                    </span>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800">
                                    <div className="p-2">
                                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                            {auth.name}
                                        </p>
                                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                            {auth.email}
                                        </p>
                                    </div>

                                    <div className="py-1 space-y-0.5">
                                        {(auth.role === "admin" || auth.role === "barista") && (
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setUserDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                            >
                                                <HiOutlineViewGrid className="text-base" />
                                                Dashboard Panel
                                            </Link>
                                        )}
                                        <Link
                                            to="/my-wallet"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <HiOutlineCreditCard className="text-base" />
                                            Digital Wallet
                                        </Link>
                                        <Link
                                            to="/my-transaction"
                                            onClick={() => setUserDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <HiOutlineDocumentText className="text-base" />
                                            Transactions
                                        </Link>
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            onClick={() => {
                                                setUserDropdownOpen(false);
                                                openLogoutModal();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                        >
                                            <HiOutlineLogout className="text-base" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : !isAuthPage ? (
                        <div className="hidden sm:flex items-center gap-2.5">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                Join Member
                            </Link>
                        </div>
                    ) : null}

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={onToggleMobileMenu}
                        className="md:hidden p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileMenuOpen ? <HiX className="w-5 h-5" /> : <HiMenu className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default ClientNavbar;
