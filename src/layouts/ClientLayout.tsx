import {Link, NavLink, Outlet, useLocation} from "react-router";
import Icon from "../assets/images/icon.png";
import useSideBar from "../hook/useSideBar.tsx";
import useAuthContext from "../hook/useAuthContext.ts";
import ProfileTab from "../component/ProfileTab.tsx";
import Footer from "../component/Footer.tsx";
import {useEffect, useState} from "react";
import useTheme from "../hook/useTheme.ts";
import {BiSun} from "react-icons/bi";
import {BsMoon} from "react-icons/bs";

const ClientLayout = () => {
    const location = useLocation();
    const {dataTabProfileUser, dataTabProfileUserSmall} = useSideBar();
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const auth = useAuthContext();
    const {theme, toggleTheme} = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (auth.loading) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <nav className="container px-4 mx-auto py-7 flex items-center gap-16 justify-between">
                    <div className="flex items-center gap-16">
                        <img src={Icon} alt="Logo" className="w-14 h-14"/>
                        <div className="sm:flex hidden items-center gap-8">
                            <NavLink
                                to="/"
                                className={({isActive}) =>
                                    `link ${isActive ? 'font-bold' : ''} dark:text-white`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/menu"
                                className={({isActive}) =>
                                    `link ${isActive ? 'font-bold' : ''} dark:text-white`
                                }
                            >
                                Menu
                            </NavLink>
                            <NavLink
                                to="/location"
                                className={({isActive}) =>
                                    `link ${isActive ? 'font-bold' : ''} dark:text-white`
                                }
                            >
                                Location
                            </NavLink>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {auth.isAuth ? (
                            isSmallScreen ? (
                                <ProfileTab
                                    user={{role: auth.role, name: auth.name}}
                                    dataTabProfileUser={dataTabProfileUserSmall}
                                />
                            ) : (
                                <ProfileTab
                                    user={{role: auth.role, name: auth.name}}
                                    dataTabProfileUser={dataTabProfileUser}
                                />
                            )
                        ) : location.pathname === '/login' ? (
                            <Link
                                to="/register"
                                className="btn-primary-outline font-bold text-black dark:text-white px-12 py-3 rounded-2xl"
                            >
                                Sign Up
                            </Link>
                        ) : location.pathname === '/register' ? (
                            <Link
                                to="/login"
                                className="btn-primary text-white px-12 font-bold py-3 rounded-2xl "
                            >
                                Login
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="btn-primary-outline font-bold text-black dark:text-white px-12 py-3 rounded-2xl"
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-primary text-white px-12 font-bold py-3 rounded-2xl "
                                >
                                    Login
                                </Link>
                            </>
                        )}
                        <button
                            onClick={toggleTheme}
                            className=" bg-gray-200 dark:bg-gray-700 w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer"
                        >
                            {theme === "light" ? (
                                <BiSun className="w-6 h-6 text-yellow-500"/>
                            ) : (
                                <BsMoon className="w-6 h-6 text-gray-200"/>
                            )}
                        </button>
                    </div>
                </nav>
            </header>
            <main className="flex-1 bg-[#F2F2F2] dark:bg-gray-900">
                <Outlet/>
            </main>
            {location.pathname !== '/login' &&
                location.pathname !== '/register' &&
                location.pathname !== '/' && <Footer/>}
        </div>
    );
};

export default ClientLayout;
