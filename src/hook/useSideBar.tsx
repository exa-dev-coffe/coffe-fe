import {RxDashboard, RxHome} from "react-icons/rx";
import {MdInventory, MdRestaurantMenu} from "react-icons/md";
import {CgNotes} from "react-icons/cg";
import {IoIosPersonAdd} from "react-icons/io";
import {GiTable} from "react-icons/gi";
import {IoCartOutline, IoPersonOutline} from "react-icons/io5";
import {PiDoorOpen} from "react-icons/pi";
import useLogoutContext from "./useLogoutContext.ts";
import {CiViewList} from "react-icons/ci";
import {FaWallet} from "react-icons/fa";
import {BsMoon} from "react-icons/bs";
import {BiSun} from "react-icons/bi";
import useThemeContext from "./useThemeContext.ts";

const useSideBar = () => {

    const logout = useLogoutContext()
    const {theme, toggleTheme} = useThemeContext()

    const dataMainDashboardAdmin = [
        {
            title: 'Dashboard',
            icon: <RxDashboard/>,
            to: '/dashboard/menu'
        },
        {
            title: 'Manage Catalog',
            icon: <MdRestaurantMenu/>,
            to: '/dashboard/manage-catalog'
        },
        {
            title: "Manage Categories",
            icon: <CgNotes/>,
            to: '/dashboard/manage-category'
        },
        {
            title: "Manage Barista",
            icon: <IoIosPersonAdd/>,
            to: '/dashboard/manage-barista'
        },
        {
            title: "Manage Table",
            icon: <GiTable/>,
            to: '/dashboard/manage-table'
        }
    ]

    const dataMainDashboardBarista = [
        {
            title: 'Dashboard',
            icon: <RxDashboard/>,
            to: '/dashboard/menu'
        },
        {
            title: 'Manage Order',
            icon: <CiViewList/>,
            to: '/dashboard/manage-order'
        },
        {
            title: 'Manage Inventory',
            icon: <MdInventory/>,
            to: '/dashboard/manage-inventory'
        },
    ]

    const dataAccountAdmin = [
        {
            title: 'Profile',
            icon: <IoPersonOutline/>,
            to: '/dashboard/my-profile'
        },
        {
            title: theme === "light" ? "Dark Mode" : "Light Mode",
            icon: theme === "light" ? <BsMoon className="w-5 h-5 text-gray-800"/> :
                <BiSun className="w-5 h-5 text-yellow-500"/>,
            onClick: toggleTheme
        },
        {
            title: 'Logout',
            icon: <PiDoorOpen/>,
            onClick: () => {
                logout.setLogout({
                    show: true
                })
            }
        }
    ]

    const dataAccountBarista = [
        {
            title: 'Profile',
            icon: <IoPersonOutline/>,
            to: '/dashboard/my-profile'
        },
        {
            title: 'Logout',
            icon: <PiDoorOpen/>,
            onClick: () => {
                logout.setLogout({
                    show: true
                })
            }
        }
    ]

    const dataTabProfileUser = [
        {
            title: 'Cart',
            icon: <IoCartOutline/>,
            to: '/my-cart'
        },
        {
            title: 'Wallet',
            icon: <FaWallet/>,
            to: '/my-wallet'
        },
        {
            title: 'Transaction',
            icon: <CiViewList/>,
            to: '/my-transaction'
        },
        {
            title: theme === "light" ? "Dark Mode" : "Light Mode",
            icon: theme === "light" ? <BsMoon className="w-5 h-5 text-gray-800"/> :
                <BiSun className="w-5 h-5 text-yellow-500"/>,
            onClick: toggleTheme
        },
        {
            title: 'Logout',
            icon: <PiDoorOpen/>,
            onClick: () => {
                logout.setLogout({
                    show: true
                })
            }
        }
    ]

    const dataTabProfileUserSmall = [
        {
            title: "Home",
            icon: <RxHome/>,
            to: "/"
        },
        {
            title: 'Menu',
            icon: <MdRestaurantMenu/>,
            to: '/menu'
        },
        {
            title: 'Location',
            icon: <MdInventory/>,
            to: '/location'
        },
        {
            title: 'Cart',
            icon: <IoCartOutline/>,
            to: '/my-cart'
        },
        {
            title: 'Wallet',
            icon: <FaWallet/>,
            to: '/my-wallet'
        },
        {
            title: 'Transaction',
            icon: <CiViewList/>,
            to: '/my-transaction'
        },
        {
            title: 'Logout',
            icon: <PiDoorOpen/>,
            onClick: () => {
                logout.setLogout({
                    show: true
                })
            }
        }
    ]

    return {
        dataMainDashboardAdmin,
        dataAccountAdmin,
        dataMainDashboardBarista,
        dataAccountBarista,
        dataTabProfileUserSmall,
        dataTabProfileUser
    }

}

export default useSideBar;