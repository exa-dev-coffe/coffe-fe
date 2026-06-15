import { Link, NavLink, Outlet, useLocation } from "react-router";
import Icon from "../assets/images/icon.png";
import useSideBar from "../hook/useSideBar";
import useAuthContext from "../hook/useAuthContext";
import ProfileTab from "../component/ProfileTab";
import Footer from "../component/Footer";
import { useEffect, useState } from "react";
import ThemeMenu from "../component/ThemeMenu";
import { HiMenu, HiX } from "react-icons/hi";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `link text-sm font-medium ${isActive ? "font-bold text-primary" : "text-gray-700 dark:text-gray-300"} hover:text-primary dark:hover:text-primary`;

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block py-2 text-sm ${isActive ? "font-bold text-primary" : "text-gray-700 dark:text-gray-300"}`;

const ClientLayout = () => {
  const location = useLocation();
  const { dataTabProfileUser, dataTabProfileUserSmall } = useSideBar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useAuthContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAuthPage = [
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
  ].includes(location.pathname);
  const showFooter = !isAuthPage && location.pathname !== "/";

  if (auth.loading) return null;

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <nav className="container px-4 mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0">
              <img src={Icon} alt="Diskusi Coffee" className="w-12 h-12" />
            </Link>
            <div className="hidden sm:flex items-center gap-8">
              <NavLink to="/" end className={navLinkClass}>Home</NavLink>
              <NavLink to="/menu" className={navLinkClass}>Menu</NavLink>
              <NavLink to="/location" className={navLinkClass}>Location</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {auth.isAuth ? (
              <ProfileTab
                user={{ role: auth.role, name: auth.name }}
                dataTabProfileUser={
                  window.innerWidth < 640
                    ? dataTabProfileUserSmall
                    : dataTabProfileUser
                }
              />
            ) : !isAuthPage ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link to="/register" className="btn-primary-outline font-bold text-sm px-6 py-2.5 rounded-xl">
                  Sign Up
                </Link>
                <Link to="/login" className="btn-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold">
                  Login
                </Link>
              </div>
            ) : null}

            <button
              className="sm:hidden text-2xl text-gray-700 dark:text-gray-300 hover:cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <HiX /> : <HiMenu />}
            </button>

            <ThemeMenu />
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 space-y-3">
            <NavLink to="/" end className={mobileNavLinkClass}>Home</NavLink>
            <NavLink to="/menu" className={mobileNavLinkClass}>Menu</NavLink>
            <NavLink to="/location" className={mobileNavLinkClass}>Location</NavLink>
            {!auth.isAuth && (
              <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link to="/register" className="btn-primary-outline text-sm px-4 py-2 rounded-xl flex-1 text-center">
                  Sign Up
                </Link>
                <Link to="/login" className="btn-primary text-sm px-4 py-2 rounded-xl flex-1 text-center text-white">
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 bg-[#F2F2F2] dark:bg-gray-900">
        <div key={location.pathname} className="page-enter-active">
          <Outlet />
        </div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default ClientLayout;
