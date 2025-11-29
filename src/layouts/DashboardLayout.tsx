// src/layouts/DashboardLayout.tsx
import {Navigate, Outlet} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import useAuthContext from "../hook/useAuthContext.ts";
import ButtonSidebar from "../component/ButtonSidebar.tsx";
import useSideBar from "../hook/useSideBar.tsx";
import {useEffect, useRef, useState} from "react";
import {IoMdClose} from "react-icons/io";
import {BsList} from "react-icons/bs";

const DashboardLayout = () => {
    const auth = useAuthContext()
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

        window.addEventListener(
            "resize",
            handleResize
        )

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousedown", handleClickOutside);
        }
    }, []);

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
        <div className="flex min-h-screen">
            <aside
                ref={refSideBar}
                className={` ${open ? 'sm:w-72 w-52' : 'w-0'} h-full overflow-x-hidden fixed z-50 sm:bg-none bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg dark:shadow-xl border-r border-gray-200 dark:border-gray-800 rounded-tr-2xl rounded-br-2xl lg:rounded-tr-none lg:rounded-br-none transition-width duration-300`}>
                <div>
                    <button
                        className="text-3xl lg:hidden absolute right-4 top-4 hover:cursor-pointer text-gray-900 dark:text-gray-100"
                        onClick={handleSideBar}>
                        <IoMdClose/>
                    </button>
                </div>

                <div
                    className={'sm:w-72 w-52 text-gray-900  dark:text-gray-100 flex flex-col justify-between h-full'}>
                    <div>
                        <div className={'p-14 flex flex-col items-center'}>
                            <img
                                src={auth.photo ? `${auth.photo}` : DummyProfile}
                                alt={"profile"}
                                className={"sm:w-36 w-24 sm:h-36 h-24 mx-auto rounded-full ring-2 ring-gray-200 dark:ring-gray-700"}
                            />
                            <div className={'text-center mt-4'}>
                                <h2 className={'text-2xl font-bold text-gray-900 dark:text-gray-100'}>
                                    {auth.name}
                                </h2>
                                <h5 className={'mt-1 font-light text-gray-500 dark:text-gray-400'}>
                                    {auth.role}
                                </h5>
                            </div>
                        </div>

                        <div className={'ps-6'}>
                            <div className="flex items-center gap-2 mb-2">
                                <h4 className={'font-medium sm:text-lg text-sm text-gray-700 dark:text-gray-300'}>MAIN</h4>
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

                        <div className={'ps-6 mt-10'}>
                            <h4 className={'font-light sm:text-lg text-sm text-gray-700 dark:text-gray-300'}>ACCOUNT</h4>
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
            <main
                className={`${open ? 'lg:ms-72 ' : 'ms-0  '} w-full duration-300 transition-all bg-[#F2F2F2] dark:bg-gray-900`}>
                <nav className={'container mx-auto  pt-3 px-4'}>
                    {
                        open ?
                            <button className="text-3xl hover:cursor-pointer text-gray-900 dark:text-gray-100"
                                    onClick={handleSideBar}>
                                <IoMdClose/>
                            </button> :
                            <button className="text-3xl hover:cursor-pointer text-gray-900 dark:text-gray-100"
                                    onClick={handleSideBar}>
                                <BsList/>
                            </button>
                    }
                </nav>

                <div className="container mx-auto px-4 pb-10 lg:pt-3">
                    <div
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-md p-6 transition-colors lg:border-l lg:border-gray-200 dark:lg:border-gray-700">
                        <Outlet/>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;