import React from "react";
import {NavLink, Outlet} from "react-router";
import PageHeader from "@/components/shared/PageHeader.tsx";
import {HiOutlineTag, HiOutlineQuestionMarkCircle} from "react-icons/hi";

export const ManageCategoryLayout: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Manage Categories"
                subtitle="Organize your menu catalog into curated coffee, beverages, and food categories."
                breadcrumb={[
                    {label: "Dashboard", to: "/dashboard/menu"},
                    {label: "Categories"},
                ]}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-700/80">
                <NavLink
                    to="/dashboard/manage-category/list-category"
                    className={({isActive}) =>
                        `flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                            isActive
                                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`
                    }
                >
                    <HiOutlineTag className="text-base" />
                    <span>All Categories</span>
                </NavLink>

                <NavLink
                    to="/dashboard/manage-category/list-uncategorized"
                    className={({isActive}) =>
                        `flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                            isActive
                                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`
                    }
                >
                    <HiOutlineQuestionMarkCircle className="text-base" />
                    <span>Uncategorized Items</span>
                </NavLink>
            </div>

            <div className="page-fade-enter">
                <Outlet />
            </div>
        </div>
    );
};

export default ManageCategoryLayout;
