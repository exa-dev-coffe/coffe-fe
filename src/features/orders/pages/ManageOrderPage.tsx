import React, { useState } from "react";
import { useOrderQuery } from "@/features/orders/hooks/useOrder.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import BaristaOrderCard from "@/features/orders/components/BaristaOrderCard.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { HiOutlineClipboardList, HiOutlineSearch } from "react-icons/hi";

export const ManageOrderPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const searchDebounce = useDebounce((val: string) => {
        setDebouncedSearch(val);
        setPage(1);
    }, 400);

    const { data: orderResponse, isLoading } = useOrderQuery(page, 10, {
        search: debouncedSearch,
    });

    const data = orderResponse?.data || [];
    const totalData = orderResponse?.totalData || 0;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        searchDebounce(val);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Incoming Barista Orders"
                subtitle="Live order queue. Track tickets, review item instructions, and advance order status."
                breadcrumb={[
                    { label: "Dashboard", to: "/dashboard/menu" },
                    { label: "Orders Queue" },
                ]}
            />

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search orders by customer name..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
                    />
                </div>
            </div>

            {/* Orders Queue List */}
            {isLoading && data.length === 0 ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                        >
                            <Skeleton variant="text" width="30%" />
                            <Skeleton variant="rounded" height={60} />
                        </div>
                    ))}
                </div>
            ) : data.length === 0 ? (
                <EmptyState
                    icon={<HiOutlineClipboardList />}
                    title="No Incoming Orders"
                    description="No orders found for the current filter. New customer orders will pop up here in real-time."
                />
            ) : (
                <div className="space-y-6">
                    <div className="space-y-4">
                        {data.map((order) => (
                            <BaristaOrderCard key={order.id} order={order} />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalData={totalData}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}
        </div>
    );
};

export default ManageOrderPage;
