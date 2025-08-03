import {Navigate, Outlet} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import useAuthContext from "../hook/useAuthContext.ts";
import ButtonSidebar from "../component/ButtonSidebar.tsx";
import useSideBar from "../hook/useSideBar.tsx";
import {useState} from "react";
import {IoMdClose} from "react-icons/io";
import {BsList} from "react-icons/bs";

const DashboardLayout = () => {
    const auth = useAuthContext()
    const {dataMainDashboardAdmin, dataAccountAdmin} = useSideBar()
    const [open, setOpen] = useState(true)

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
            <aside className={` ${open ? 'w-72' : 'w-0'} overflow-x-hidden transition-width duration-300`}>
                <div className={'w-72'}>
                    <div className={'p-14'}>
                        <img src={DummyProfile} alt={"profile"} className={"w-36 mx-auto rounded-full"}/>
                        <div className={'text-center mt-4'}>
                            <h2 className={'text-2xl font-bold'}>
                                {auth.auth.name}
                            </h2>
                            <h5 className={'mt-1 font-light'}>
                                {auth.auth.role}
                            </h5>
                        </div>
                    </div>
                    <div className={'ps-6'}>
                        <h4 className={'font-light '}>MAIN</h4>
                        {
                            dataMainDashboardAdmin.map((button, index) => (
                                <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}/>
                            ))
                        }
                    </div>
                    <div className={'ps-6 mt-10'}>
                        <h4 className={'font-light '}>ACCOUNT</h4>
                        {
                            dataAccountAdmin.map((button, index) => (
                                <ButtonSidebar key={index} to={button.to} title={button.title} icon={button.icon}
                                               onClick={button.onClick}/>
                            ))
                        }
                    </div>
                </div>
            </aside>
            <main className="flex-1 bg-[#F2F2F2]">
                <nav className={'container mx-auto pt-3'}>
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