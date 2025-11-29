import {useEffect, useRef, useState} from "react";
import {BiSun} from "react-icons/bi";
import {BsMoon} from "react-icons/bs";
import {HiDotsVertical, HiLogin, HiUserAdd} from "react-icons/hi";
import useTheme from "../hook/useTheme.ts";
import {Link, useLocation} from "react-router";
import {MdInventory, MdRestaurantMenu} from "react-icons/md";

export default function ThemeMenu() {
    const [open, setOpen] = useState(false);
    const {theme, toggleTheme} = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // close when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger icon */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(!open)}
                onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
                className="w-10 h-10 flex items-center justify-center
                   bg-gray-200 dark:bg-gray-700
                   rounded-full cursor-pointer hover:bg-gray-300
                   dark:hover:bg-gray-600 transition"
            >
                <HiDotsVertical className="w-6 h-6 text-gray-700 dark:text-gray-200"/>
            </div>

            {/* Popover */}
            {open && (
                <div
                    className="absolute right-0 mt-2 w-44
                     bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-700
                     shadow-lg rounded-xl p-3
                     animate-fade-in z-20"
                >
                    <Link
                        to="/menu"
                        className="flex sm:hidden items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition text-left text-sm text-gray-700 dark:text-gray-100"
                    >
                        <MdRestaurantMenu className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                        <span>Menu</span>
                    </Link>
                    <Link
                        to="/location"
                        className="flex sm:hidden items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition text-left text-sm text-gray-700 dark:text-gray-100"
                    >
                        <MdInventory className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                        <span>Location</span>
                    </Link>
                    {/* Auth Links */}
                    {location.pathname === "/login" ? (
                        <Link
                            to="/register"
                            className="flex items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition text-left text-sm text-gray-700 dark:text-gray-100"
                        >
                            <HiUserAdd className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                            <span>Sign Up</span>
                        </Link>
                    ) : location.pathname === "/register" ? (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition text-left text-sm text-gray-700 dark:text-gray-100"
                        >
                            <HiLogin className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                            <span>Login</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/register"
                                className="flex items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition text-left text-sm text-gray-700 dark:text-gray-100"
                            >
                                <HiUserAdd className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                                <span>Sign Up</span>
                            </Link>

                            <Link
                                to="/login"
                                className="flex items-center gap-2 w-full px-2 py-2 mt-1 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-gray-700
                 transition text-left text-sm text-gray-700 dark:text-gray-100"
                            >
                                <HiLogin className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                                <span>Login</span>
                            </Link>
                        </>
                    )}


                    {/* Theme Switch */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 w-full px-2 py-2 mt-2
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                       transition text-left"
                    >
                        {theme === "dark" ? (
                            <>
                                <BiSun className="w-5 h-5 text-yellow-500"/>
                                <span className="text-sm text-gray-700 dark:text-gray-100">
                  Light Mode
                </span>
                            </>
                        ) : (
                            <>
                                <BsMoon className="w-5 h-5 text-gray-800"/>
                                <span className="text-sm text-gray-700">
                  Dark Mode
                </span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
