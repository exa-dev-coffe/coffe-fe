import {Navigate, Outlet, useLocation} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import useAuthContext from "../hook/useAuthContext.ts";
import ButtonSidebar from "../component/ButtonSidebar.tsx";
import useSideBar from "../hook/useSideBar.tsx";
import {useEffect, useRef, useState} from "react";
import {IoMdClose} from "react-icons/io";
import {BsList} from "react-icons/bs";

const DashboardLayout = () => {
    const auth = useAuthContext()
    const location = useLocation();
    const {dataMainDashboardAdmin, dataAccountAdmin, dataMainDashboardBarista, dataAccountBarista} = useSideBar()
    const [open, setOpen] = useState(true)
    const refSideBar = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (window.innerWidth < 1024) {
            setOpen(false);
        }

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setOpen(false);
            } else {
                setOpen(true);
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            const sidebarElement = refSideBar.current;
            if (open && sidebarElement && !sidebarElement.contains(event.target as Node) && window.innerWidth < 1024) {
                setOpen(false);
            }
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousedown", handleClickOutside);
        }
    }, [open]);

    if (auth.loading) {
        return null
    }

    if (!auth.isAuth) {
        return <Navigate to="/login" replace={true}/>
    }

    const handleSideBar = () => {
        setOpen(!open);
    }

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Mobile overlay */}
            {open && window.innerWidth < 1024 && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                ref={refSideBar}
                className={`${open ? 'translate-x-0' : '-translate-x-full'} 
                    fixed lg:translate-x-0 top-0 left-0 h-full z-50
                    w-64 overflow-y-auto
                    bg-white dark:bg-gray-900 
                    border-r border-gray-200 dark:border-gray-800
                    shadow-lg dark:shadow-2xl
                    transition-transform duration-300 ease-in-out`}>
                <div>
                    <button
                        className="text-3xl lg:hidden absolute right-4 top-4 hover:cursor-pointer text-gray-900 dark:text-gray-100"
                        onClick={handleSideBar}
                        aria-label="Close sidebar">
                        <IoMdClose/>
                    </button>
                </div>

                <div className="text-gray-900 dark:text-gray-100 flex flex-col justify-between h-full">
                    <div>
                        <div className="p-8 flex flex-col items-center">
                            <img
                                src={auth.photo ? `${auth.photo}` : DummyProfile}
                                alt={"Profile"}
                                className={"w-28 h-28 rounded-full ring-2 ring-gray-200 dark:ring-gray-700 object-cover"}
                            />
                            <div className="text-center mt-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {auth.name}
                                </h2>
                                <h5 className="mt-1 text-sm font-light text-gray-500 dark:text-gray-400 capitalize">
                                    {auth.role}
                                </h5>
                            </div>
                        </div>

                        <div className="px-4">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">MAIN</h4>
                            </div>
                            {
                                auth.role.toLowerCase() === "admin" ?
                                    dataMainDashboardAdmin.map((button, index) => (
                                        <ButtonSidebar key={index} to={button.to} title={button.title}
                                                       icon={button.icon}/>
                                    )) :
                                    dataMainDashboardBarista.map((button, index) => (
                                        <ButtonSidebar key={index} to={button.to} title={button.title}
                                                       icon={button.icon}/>
                                    ))
                            }
                        </div>

                        <div className="px-4 mt-8">
                            <div className="flex items-center gap-2 mb-2 px-2">
                                <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACCOUNT</h4>
                            </div>
                            {
                                auth.role.toLowerCase() === "admin" ?
                                    dataAccountAdmin.map((button, index) => (
                                        <ButtonSidebar key={index} to={button.to} title={button.title}
                                                       icon={button.icon} onClick={button.onClick}/>
                                    )) :
                                    dataAccountBarista.map((button, index) => (
                                        <ButtonSidebar key={index} to={button.to} title={button.title}
                                                       icon={button.icon} onClick={button.onClick}/>
                                    ))
                            }
                        </div>
                    </div>
                </div>
            </aside>

            <main className={`${open ? 'lg:ml-64' : ''} w-full min-h-screen transition-all duration-300`}>
                <nav className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
                    <div className="container mx-auto px-4 py-3 flex items-center">
                        <button
                            className="text-2xl hover:cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            onClick={handleSideBar}
                            aria-label={open ? "Close sidebar" : "Open sidebar"}>
                            {open ? <IoMdClose/> : <BsList/>}
                        </button>
                    </div>
                </nav>

                <div className="container mx-auto px-4 pb-10 pt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-md p-6 transition-colors">
                        <div key={location.pathname} className="page-enter-active">
                            <Outlet/>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;