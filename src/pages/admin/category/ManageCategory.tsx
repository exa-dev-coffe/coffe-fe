import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {NavLink, Outlet} from "react-router";
import Card from "../../../component/ui/Card.tsx";

const ManageCategoryPage = () => {
    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'Manage Categories'}
                             description={'Organize and manage all categories available in your menu.'}/>
            <Card variant="dashboard" className="mt-10">
                <div className={'flex items-center sm:text-xl text-sm justify-center sm:gap-6 gap-3'}>
                    <NavLink to={"/dashboard/manage-category/list-category"}
                             className={({isActive}) => {
                                 return `px-4 py-2 rounded-lg transition-colors ${
                                     isActive
                                         ? 'font-bold bg-primary text-white'
                                         : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
                                 }`
                             }}>
                        List Categories
                    </NavLink>
                    <NavLink to={"/dashboard/manage-category/list-uncategorized"}
                             className={({isActive}) => {
                                 return `px-4 py-2 rounded-lg transition-colors ${
                                     isActive
                                         ? 'font-bold bg-primary text-white'
                                         : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
                                 }`
                             }}>
                        List Uncategorized
                    </NavLink>
                </div>
            </Card>
            <Outlet/>
        </div>
    );
}

export default ManageCategoryPage;