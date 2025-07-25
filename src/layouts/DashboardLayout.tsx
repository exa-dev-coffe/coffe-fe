import {Navigate, NavLink, Outlet} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import useAuthContext from "../hook/useAuthContext.ts";
import {RxDashboard} from "react-icons/rx";

const DashboardLayout = () => {
    const auth = useAuthContext()

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
                    <div className={'mt-4'}>
                        <NavLink to={"/dashboard"}
                                 className={'flex items-center gap-2 text-lg font-semibold px-4 border-r-2 border-r-gray-500'}>
                            <RxDashboard/>
                            Dashboard
                        </NavLink>
                    </div>
                </div>
            </aside>
            <main className="flex-1 bg-[#F2F2F2]">
                <Outlet/>
            </main>
        </div>
    );
}

export default DashboardLayout;