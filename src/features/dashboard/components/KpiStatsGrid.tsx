import React from "react";
import Card from "@/components/ui/Card.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import {HiOutlineCurrencyDollar, HiOutlineShoppingBag, HiOutlineTrendingUp} from "react-icons/hi";

export interface KpiStatsGridProps {
    totalRevenue: number;
    totalOrders: number;
    aov: number;
    loading?: boolean;
}

export const KpiStatsGrid: React.FC<KpiStatsGridProps> = ({
    totalRevenue,
    totalOrders,
    aov,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* KPI 1: Total Revenue */}
            <Card variant="glass" className="p-6 space-y-3 relative overflow-hidden border-amber-500/20">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        Total Revenue
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
                        <HiOutlineCurrencyDollar />
                    </div>
                </div>
                <div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(totalRevenue)}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                        <HiOutlineTrendingUp /> Verified store income
                    </p>
                </div>
            </Card>

            {/* KPI 2: Total Orders */}
            <Card variant="glass" className="p-6 space-y-3 relative overflow-hidden border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        Total Orders
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl">
                        <HiOutlineShoppingBag />
                    </div>
                </div>
                <div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {totalOrders}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Completed & active customer tickets
                    </p>
                </div>
            </Card>

            {/* KPI 3: Average Order Value */}
            <Card variant="glass" className="p-6 space-y-3 relative overflow-hidden border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        Average Order Value
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                        <HiOutlineTrendingUp />
                    </div>
                </div>
                <div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(aov)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Average customer spend per order
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default KpiStatsGrid;
