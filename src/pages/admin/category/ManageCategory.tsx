// src/pages/admin/category/ManageCategory.tsx
import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {NavLink, Outlet} from "react-router";

const ManageCategoryPage = () => {
    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'Manage Categories'}
                             description={`you can organize and manage all categories available in your menu.`}/>
            <div
                className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg border border-slate-100 dark:border-slate-700'}>
                <div className={'flex items-center sm:text-xl text-sm justify-center sm:gap-4 gap-2'}>
                    <NavLink to={"/dashboard/manage-category/list-category"}
                             className={({isActive}) => {
                                 return `px-2 ${isActive ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
                             }}>
                        List Categories
                    </NavLink>
                    <NavLink to={"/dashboard/manage-category/list-uncategorized"}
                             className={({isActive}) => {
                                 return `px-2 ${isActive ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`
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