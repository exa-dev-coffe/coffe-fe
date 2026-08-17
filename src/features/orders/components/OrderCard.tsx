import React from "react";
import {Link} from "react-router";
import Card from "@/components/ui/Card.tsx";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import {formatCurrency, formatDateTime} from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {HiOutlineArrowRight, HiOutlineDesktopComputer} from "react-icons/hi";
import type {OrderItem} from "@/features/orders/types/order.types.ts";

export interface OrderCardProps {
    order: OrderItem;
}

export const OrderCard: React.FC<OrderCardProps> = ({order}) => {
    const firstItem = order.details?.[0];
    const totalItems = order.details?.reduce((sum, item) => sum + item.qty, 0) || 1;

    return (
        <Link to={`/my-transaction/${order.id}`} className="block group">
            <Card
                variant="interactive"
                className="p-5 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800"
            >
                {/* Header: Order ID, Date, and Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            Order #{order.id}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDateTime(order.createdAt)}
                        </span>
                    </div>

                    <OrderStatusBadge status={order.orderStatus} size="sm" />
                </div>

                {/* Body Preview */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        {firstItem && (
                            <img
                                src={firstItem.photo || DummyProduct}
                                alt={firstItem.menuName}
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = DummyProduct;
                                }}
                                className="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                        )}
                        <div className="min-w-0 space-y-1">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                {firstItem ? `${firstItem.qty}x ${firstItem.menuName}` : `Order #${order.id}`}
                                {order.details && order.details.length > 1 && (
                                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                                        (+{order.details.length - 1} more items)
                                    </span>
                                )}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                    <HiOutlineDesktopComputer className="text-amber-500" />
                                    Table #{order.tableName || order.tableId || "N/A"}
                                </span>
                                <span>•</span>
                                <span>{totalItems} total items</span>
                            </div>
                        </div>
                    </div>

                    {/* Total Price & Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                Total Bill
                            </span>
                            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                                {formatCurrency(order.totalPrice)}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm group-hover:bg-amber-500/10 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            <HiOutlineArrowRight />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default OrderCard;
