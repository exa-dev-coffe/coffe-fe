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

    if (auth.auth.loading) {
        return null
    }

    if (!auth.auth.isAuth) {
        return <Navigate to="/login" replace={true}/>
    }

    const handleSideBar = () => {
        setOpen(!open);
    }


    return (
        <div className="flex min-h-screen">
            <aside
                ref={refSideBar}
                className={` ${open ? 'sm:w-72 w-52' : 'w-0'} overflow-x-hidden h-full lg:static  fixed z-50 sm:bg-none bg-white transition-width duration-300`}>
                <div>
                    <button className="text-3xl lg:hidden absolute right-4 top-4 hover:cursor-pointer"
                            onClick={handleSideBar}>
                        <IoMdClose/></button>
                </div>
                <div className={'sm:w-72 w-52 '}>
                    <div className={'p-14'}>
                        <img src={
                            auth.auth.photo ? `${auth.auth.photo}` : DummyProfile
                        } alt={"profile"} className={"sm:w-36 w-24 sm:h-36 h-24 mx-auto rounded-full"}/>
                        <div className={'text-center mt-4'}>
                            <h2 className={'text-2xl font-bold'}>
                                {auth.auth.name}
                            </h2>
                            <h5 className={'mt-1 font-light'}>
                                {auth.auth.role}
                            </h5>
                        </div>
                    </div>
                    <div className={'ps-6 '}>
                        <h4 className={'font-light sm:text-lg text-sm '}>MAIN</h4>
                        {
                            auth.auth.role.toLowerCase() === "admin" ?
                                dataMainDashboardAdmin.map((button, index) => (
                                    <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}/>
                                )) :
                                dataMainDashboardBarista.map((button, index) => (
                                    <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}/>
                                ))
                        }
                    </div>
                    <div className={'ps-6 mt-10'}>
                        <h4 className={'font-light sm:text-lg text-sm '}>ACCOUNT</h4>
                        {
                            auth.auth.role.toLowerCase() === "admin" ?
                                dataAccountAdmin.map((button, index) => (
                                    <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}
                                                   onClick={button.onClick}/>
                                )) :
                                dataAccountBarista.map((button, index) => (
                                    <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}
                                                   onClick={button.onClick}/>
                                ))
                        }
                    </div>
                </div>
            </aside>
            <main className="flex-1 w-full bg-[#F2F2F2]">
                <nav className={'container mx-auto pt-3 px-4'}>
                    {
                        open ?
                            <button className="text-3xl hover:cursor-pointer" onClick={handleSideBar}>
                                <IoMdClose/></button> :
                            <button className="text-3xl hover:cursor-pointer" onClick={handleSideBar}><BsList/>
                            </button>
                    }
                </nav>
                <Outlet/>
            </main>
        </div>
    );
}

export default DashboardLayout;