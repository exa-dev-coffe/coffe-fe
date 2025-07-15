import {Link, NavLink, Outlet, useLocation} from "react-router";
import Icon from "../assets/images/icon.png";

const ClientLayout = () => {

    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className={'container mx-auto py-7 flex items-center gap-16 justify-between'}>
                    <div className={'flex items-center gap-16'}>
                        <img src={Icon} alt={'Logo'} className={'w-12'}/>
                        <div className={'flex items-center gap-8'}>
                            <NavLink to={'/'} className={({isActive}) => `link ${isActive ? 'font-bold' : ''}`}>
                                Home
                            </NavLink>
                            <NavLink to={'/menu'} className={({isActive}) => `link ${isActive ? 'font-bold' : ''}`}>
                                Menu
                            </NavLink>
                            <NavLink to={'/location'}>
                                Location
                            </NavLink>
                        </div>
                    </div>
                    <div className={'flex items-center gap-6'}>
                        {
                            location.pathname === '/login' ?
                                <Link to={'/register'}
                                      className={'btn-primary-outline font-bold text-black px-12 py-3 rounded-2xl'}>Sign
                                    Up</Link>
                                : location.pathname === '/register' ?
                                    <Link to={'/login'}
                                          className={'btn-primary text-white px-12 font-bold py-3 rounded-2xl'}>Login</Link>
                                    :
                                    <>
                                        <Link to={'/register'}
                                              className={'btn-primary-outline font-bold text-black px-12 py-3 rounded-2xl'}>Sign
                                            Up</Link>
                                        <Link to={'/login'}
                                              className={'btn-primary text-white px-12 font-bold py-3 rounded-2xl'}>Login</Link>
                                    </>
                        }

                    </div>
                </nav>
            </header>
            <main className="flex-1 bg-[#F2F2F2]">
                <Outlet/>
            </main>
        </div>
    );
}

export default ClientLayout;