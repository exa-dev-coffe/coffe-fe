import {RxDashboard} from "react-icons/rx";
import {MdRestaurantMenu} from "react-icons/md";
import {CgNotes} from "react-icons/cg";
import {IoIosPersonAdd} from "react-icons/io";
import {GiTable} from "react-icons/gi";
import {IoPersonOutline} from "react-icons/io5";
import {PiDoorOpen} from "react-icons/pi";

const useSideBar = () => {

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
                // Handle logout logic here
            }
        }
    ]


    return {
        dataMainDashboardAdmin,
        dataAccountAdmin
    }

}

export default useSideBar;