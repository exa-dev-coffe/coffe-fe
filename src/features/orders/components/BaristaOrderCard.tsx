import React from "react";
import {Link} from "react-router";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import {formatCurrency, formatDateTime} from "@/core/utils/formatters.ts";
import {HiOutlineDesktopComputer, HiOutlineUser, HiOutlineEye} from "react-icons/hi";
import type {OrderItem} from "@/features/orders/types/order.types.ts";

export interface BaristaOrderCardProps {
    order: OrderItem;
    onUpdateStatus?: (id: number) => void;
}

export const BaristaOrderCard: React.FC<BaristaOrderCardProps> = ({order}) => {
    return (
        <Card variant="interactive" className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        Order #{order.id}
                    </span>
                    <span className="text-xs text-slate-400">
                        {formatDateTime(order.createdAt)}
                    </span>
                </div>

                <OrderStatusBadge status={order.orderStatus} size="sm" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                            <HiOutlineUser className="text-amber-500 text-sm" />
                            {order.orderFor || "Customer"}
                        </span>
                        <span className="flex items-center gap-1">
                            <HiOutlineDesktopComputer className="text-amber-500 text-sm" />
                            Table #{order.tableName || order.tableId || "N/A"}
                        </span>
                    </div>

                    <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                        {formatCurrency(order.totalPrice)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link to={`/dashboard/manage-order/${order.id}`}>
                        <Button variant="primary" size="sm" leftIcon={<HiOutlineEye />}>
                            View Order Details
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default BaristaOrderCard;
