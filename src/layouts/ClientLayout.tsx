import {Link, NavLink, Outlet, useLocation} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import Icon from "../assets/images/icon.png";
import {IoCartOutline} from "react-icons/io5";

const ClientLayout = () => {

    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md sticky top-0 z-50">
                <nav className={'container mx-auto py-7 flex items-center gap-16 justify-between'}>
                    <div className={'flex items-center gap-16'}>
                        <img src={Icon} alt={'Logo'} className={'w-14 h-14'}/>
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
                        <div className={'flex relative items-center gap-8'}>
                            <div className={'text-end'}>
                                <h4 className={'font-bold text-2xl'}>Naama</h4>
                                <p className={'text-secondary text-sm'}>Role</p>
                            </div>
                            <img src={DummyProfile} className={'w-14 h-14'} alt={'profile'}/>
                            <div className={'absolute w-48 -left-5 -bottom-16 bg-white'}>
                                <div className={'my-3'}>
                                    <Link
                                        className={'px-5 flex gap-3 items-center text-base hover:text-black text-gray-600 duration-300 transition-all font-semibold'}
                                        to="/cart">
                                        <IoCartOutline className={'text-2xl'}/>
                                        Cart
                                    </Link>
                                </div>

                            </div>
                        </div>
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