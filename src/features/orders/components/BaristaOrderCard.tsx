import React from "react";
import { Link } from "react-router";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineDesktopComputer,
  HiOutlineUser,
  HiOutlineEye,
} from "react-icons/hi";
import type { OrderItem } from "@/features/orders/types/order.types.ts";

export interface BaristaOrderCardProps {
  order: OrderItem;
  onUpdateStatus?: (id: number) => void;
}

export const BaristaOrderCard: React.FC<BaristaOrderCardProps> = ({
  order,
}) => {
  return (
    <Card variant="interactive" className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-black text-slate-900 dark:text-slate-100">
            Order #{order.id}
          </span>
          {order.orderType === "TAKEAWAY" ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Takeaway
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Dine-In
            </span>
          )}
          {order.paymentMethod && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {order.paymentMethod}
            </span>
          )}
          <span className="text-xs text-slate-400 ml-1">
            {formatDateTime(order.createdAt)}
          </span>
        </div>

        <OrderStatusBadge status={order.orderStatus} size="sm" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300 flex-wrap">
            <span className="flex items-center gap-1">
              <HiOutlineUser className="text-amber-500 text-sm" />
              {order.orderFor || "Customer"}
            </span>
            {order.orderType === "TAKEAWAY" ? (
              <span className="text-slate-500">Takeaway (No Table)</span>
            ) : (
              <span className="flex items-center gap-1">
                <HiOutlineDesktopComputer className="text-amber-500 text-sm" />
                {order.tableName
                  ? `Table #${order.tableName}`
                  : order.tableId
                    ? `Table #${order.tableId}`
                    : "No Table"}
              </span>
            )}
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
