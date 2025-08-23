import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {NavLink, Outlet} from "react-router";

const ManageCategoryPage = () => {
    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'Manage Categories'}
                             description={`you can organize and manage all categories available in your menu.`}/>
            <div className={'mt-10 bg-white  p-8 rounded-lg'}>
                <div className={'flex items-center sm:text-xl text-sm justify-center sm:gap-4 gap-2'}>
                    <NavLink to={"/dashboard/manage-category/list-category"}
                             className={({isActive}) => {
                                 return `${isActive ? 'font-bold  ' : ''} `
                             }}>
                        List Categories
                    </NavLink>
                    <NavLink to={"/dashboard/manage-category/list-uncategorized"}
                             className={({isActive}) => {
                                 return `${isActive ? 'font-bold  ' : ''} `
                             }}>
                        List Uncategorized
                    </NavLink>
                </div>
            </div>
            <Outlet/>
        </div>
    );
}

export default ManageCategoryPage;