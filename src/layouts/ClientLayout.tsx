import {NavLink, Outlet} from "react-router";
import Icon from "../assets/images/icon.png";

const ClientLayout = () => {
    return (
        <div className="flex flex-col min-h-screen overflow-auto">
            <header className="bg-white ">
                <nav className={'container mx-auto py-7 flex items-center gap-16 justify-between'}>
                    <div className={'flex items-center gap-16'}>
                        <img src={Icon} alt={'Logo'} className={'w-12'}/>
                        <NavLink to={'/'}>
                            Home
                        </NavLink>
                        <NavLink to={'/menu'}>
                            Menu
                        </NavLink>
                        <NavLink to={'/location'}>
                            Location
                        </NavLink>
                    </div>
                    <button>Test</button>
                </nav>
            </header>
            <main className="flex-1 bg-[#F2F2F2]">
                <Outlet/>
            </main>
        </div>
    );
}

export default ClientLayout;