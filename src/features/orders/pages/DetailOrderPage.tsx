import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  useOrderDetailQuery,
  useUpdateOrderStatusMutation,
} from "@/features/orders/hooks/useOrder.ts";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {
  HiOutlineArrowLeft,
  HiOutlineDesktopComputer,
  HiOutlineUser,
  HiOutlineCheck,
  HiOutlineTicket,
} from "react-icons/hi";
import type { OrderDetailItem } from "../types/order.types";

export const DetailOrderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const orderId = Number(id);

  const { data: order, isLoading } = useOrderDetailQuery(orderId);
  const { mutateAsync: updateStatusOrder, isPending: actionLoading } =
    useUpdateOrderStatusMutation();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleAdvanceStatus = async () => {
    if (!order) return;
    try {
      await updateStatusOrder(order.id);
      setShowConfirmModal(false);
      navigate("/dashboard/manage-order");
    } catch {
      setShowConfirmModal(false);
    }
  };

  if (isLoading && !order) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={300} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/dashboard/manage-order">
          <Button variant="primary">Return to Orders</Button>
        </Link>
      </div>
    );
  }

  const nextActionLabel =
    order.orderStatus === 0
      ? "Start Brewing / Confirm"
      : order.orderStatus === 1
        ? "Mark Order as Completed"
        : null;

  const modalDescription =
    order.orderStatus === 0
      ? "Confirm that you've received this ticket and started preparing the drinks?"
      : "Confirm that this order has been brewed and delivered to the table?";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order Ticket #${order.id}`}
        subtitle="Review customer selections, special barista instructions, and fulfill the ticket."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Orders Queue", to: "/dashboard/manage-order" },
          { label: `Order #${order.id}` },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Link to="/dashboard/manage-order">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<HiOutlineArrowLeft />}
              >
                Back to Queue
              </Button>
            </Link>
            {nextActionLabel && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiOutlineCheck />}
                onClick={() => setShowConfirmModal(true)}
              >
                {nextActionLabel}
              </Button>
            )}
          </div>
        }
      />

      {/* Ticket Info Card */}
      <Card variant="dashboard" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400">
              Ticket Status
            </span>
            <div>
              <OrderStatusBadge status={order.orderStatus} size="md" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Ordered At</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineDesktopComputer />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Seating Table
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                Table #{order.tableName || order.tableId || "N/A"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
              <HiOutlineUser />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Order Ticket Name
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {order.orderFor || "Customer"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Items in this Order */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Order Items
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {order.details?.map((item: OrderDetailItem, idx: number) => (
            <Card key={idx} variant="default" className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={item.photo || DummyProduct}
                  alt={item.menuName}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DummyProduct;
                  }}
                  className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.qty}x {item.menuName}
                  </h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
              </div>

              {item.notes ? (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold block text-[10px] uppercase">
                    Notes:
                  </span>
                  {item.notes}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  No special instructions
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Total Paid */}
      <Card variant="elevated" className="p-6 space-y-3">
        {order.discountAmount && order.discountAmount > 0 ? (
          <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <HiOutlineTicket className="text-amber-500 text-sm" />
                Voucher Code Applied
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black tracking-wider text-xs border border-amber-500/10">
                {order.voucherCode || "VOUCHER"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              <span>Total Voucher Discount</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
          <span>Total Ticket Value</span>
          <span className="text-xl text-amber-600 dark:text-amber-400">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      </Card>

      {/* Advance Status Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleAdvanceStatus}
        title="Update Order Status"
        description={modalDescription}
        confirmText="Confirm Status"
        variant="primary"
        loading={actionLoading}
      />
    </div>
  );
};

export default DetailOrderPage;
