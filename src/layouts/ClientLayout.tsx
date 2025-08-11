import {Link, NavLink, Outlet, useLocation} from "react-router";
import DummyProfile from "../assets/images/dummyProfile.png";
import Icon from "../assets/images/icon.png";
import {useState} from "react";
import ButtonTabProfile from "../component/ButtonTabProfile.tsx";
import useSideBar from "../hook/useSideBar.tsx";

const ClientLayout = () => {

    const location = useLocation();
    const [openTabProfile, setOpenTabProfile] = useState(false);
    const {dataTabProfileUser} = useSideBar()

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
                        <div className={'relative'}
                             onMouseEnter={() => setOpenTabProfile(true)} onMouseLeave={() => setOpenTabProfile(false)}
                        >
                            <div className={'flex items-center gap-8'}>
                                <div className={'text-end'}>
                                    <h4 className={'font-bold text-2xl'}>Naama</h4>
                                    <p className={'text-secondary text-sm'}>Role</p>
                                </div>
                                <img src={DummyProfile} className={'w-14 h-14'} alt={'profile'}/>
                            </div>
                            <div
                                className={`absolute w-48 pt-7 bg-white rounded-lg shadow-md transition-all duration-300 z-50 ${openTabProfile ? 'opacity-100' : 'opacity-0'}`}>
                                {
                                    dataTabProfileUser.map((item, index) => (
                                        <ButtonTabProfile key={index} to={item.to} icon={item.icon}
                                                          onClick={item.onClick}
                                                          title={item.title}/>
                                    ))
                                }
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