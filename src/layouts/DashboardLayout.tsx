import {Navigate, Outlet} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import useAuthContext from "../hook/useAuthContext.ts";
import ButtonSidebar from "../component/ui/ButtonSidebar.tsx";
import useSideBar from "../hook/useSideBar.tsx";

const DashboardLayout = () => {
    const auth = useAuthContext()
    const {dataMainDashboardAdmin, dataAccountAdmin} = useSideBar()

    if (auth.auth.loading) {
        return null
    }

    if (!auth.auth.isAuth) {
        return <Navigate to="/login" replace={true}/>
    }


    return (
        <div className="flex min-h-screen">
            <aside>
                <div className={'p-14'}>
                    <img src={DummyProfile} alt={"profile"} className={"w-36 rounded-full"}/>
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
            </aside>
            <main className="flex-1 bg-[#F2F2F2]">
                <Outlet/>
            </main>
        </div>
    );
}

export default DashboardLayout;