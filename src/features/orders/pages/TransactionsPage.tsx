import React from "react";
import {useNavigate} from "react-router";
import { useHistoryCheckoutsInfiniteQuery } from "@/features/orders/hooks/useOrder.ts";
import OrderCard from "@/features/orders/components/OrderCard.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {HiOutlineReceiptTax, HiRefresh} from "react-icons/hi";

export const TransactionsPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading
    } = useHistoryCheckoutsInfiniteQuery(10);

    const data = infiniteData?.pages.flatMap((page) => page.data) || [];

    const handleLoadMore = () => {
        fetchNextPage();
    };

    return (
        <div className="py-10">
            <div className="container mx-auto px-4 sm:px-6 space-y-8 max-w-4xl">
                <PageHeader
                    title="My Order History"
                    subtitle="Track all your current and past coffee orders, view receipts, and rate items."
                    breadcrumb={[
                        {label: "Home", to: "/"},
                        {label: "My Transactions"},
                    ]}
                />

                {isLoading && data.length === 0 ? (
                    <div className="space-y-4">
                        {Array.from({length: 4}).map((_, i) => (
                            <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                                <Skeleton variant="text" width="30%" />
                                <Skeleton variant="rounded" height={60} />
                            </div>
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <EmptyState
                        icon={<HiOutlineReceiptTax />}
                        title="No Orders Found"
                        description="You haven't placed any coffee orders yet. Check out our menu to get started!"
                        actionLabel="Browse Menu"
                        onAction={() => navigate("/menu")}
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            {data.map((order) => (
                                <OrderCard key={order.id} order={order} />
                            ))}
                        </div>

                        {hasNextPage && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    size="md"
                                    leftIcon={<HiRefresh className={isFetchingNextPage ? "animate-spin" : ""} />}
                                    loading={isFetchingNextPage}
                                    onClick={handleLoadMore}
                                >
                                    Load More Orders
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
