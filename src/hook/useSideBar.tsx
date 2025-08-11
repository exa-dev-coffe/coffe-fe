import {RxDashboard} from "react-icons/rx";
import {MdInventory, MdRestaurantMenu} from "react-icons/md";
import {CgNotes} from "react-icons/cg";
import {IoIosPersonAdd} from "react-icons/io";
import {GiTable} from "react-icons/gi";
import {IoCartOutline, IoPersonOutline} from "react-icons/io5";
import {PiDoorOpen} from "react-icons/pi";
import useLogoutContext from "./useLogoutContext.ts";
import {CiViewList} from "react-icons/ci";
import {FaWallet} from "react-icons/fa";

const useSideBar = () => {

    const logout = useLogoutContext()

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
            title: 'Manage Order',
            icon: <CiViewList/>,
            to: '/dashboard-barista/manage-order'
        },
        {
            title: 'Manage Inventory',
            icon: <MdInventory/>,
            to: '/dashboard-barista/manage-inventory'
        },
    ]

    const dataAccountAdmin = [
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

    const dataAccountBarista = [
        {
            title: 'Profile',
            icon: <IoPersonOutline/>,
            to: '/dashboard-barista/my-profile'
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
        dataTabProfileUser
    }

}

export default useSideBar;