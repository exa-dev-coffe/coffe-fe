import React from "react";
import { useParams, Link } from "react-router";
import {
  useHistoryCheckoutDetailQuery,
  useSetRatingMutation,
} from "@/features/orders/hooks/useOrder.ts";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Rating from "@/components/ui/Rating.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {
  HiOutlineArrowLeft,
  HiOutlineDesktopComputer,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineDownload,
} from "react-icons/hi";
import type { OrderDetailItem } from "../types/order.types";

export const DetailTransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const { data: order, isLoading } = useHistoryCheckoutDetailQuery(orderId);
  const { mutateAsync: setRatingMenu } = useSetRatingMutation();

  const [submittingRatingId, setSubmittingRatingId] = React.useState<
    number | null
  >(null);

  const handleRateProduct = async (detailId: number, rating: number) => {
    if (!order || submittingRatingId === detailId) return;
    setSubmittingRatingId(detailId);
    try {
      await setRatingMenu({ detailId, rating });
      // Cache invalidation handles UI update automatically
    } catch {
      // Error is handled by global notification
    } finally {
      setSubmittingRatingId(null);
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedAmount = formatCurrency(order.totalPrice);
    const formattedDate = new Date(order.createdAt).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const itemsHtml =
      order.details
        ?.map(
          (item: OrderDetailItem) => `
      <div class="row">
        <span>${item.qty}x ${item.menuName}</span>
        <span>${formatCurrency(item.price * item.qty)}</span>
      </div>
    `,
        )
        .join("") || "";

    const htmlContent = `
      <html>
        <head>
          <title>Receipt-${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 320px; margin: 30px auto; color: #000; padding: 15px; border: 1px dashed #ccc; }
            .text-center { text-align: center; }
            .title { font-size: 18px; margin: 12px 0 4px 0; font-weight: bold; letter-spacing: 1px; }
            .subtitle { font-size: 11px; margin-bottom: 15px; color: #444; }
            .divider { border-top: 1px dashed #000; margin: 12px 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
            .total-row { font-size: 14px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="title">DISKUSI COFFEE</div>
            <div class="subtitle">Digital Receipt</div>
          </div>
          <div class="divider"></div>
          <div class="row"><span>Order ID:</span><span>#${order.id}</span></div>
          <div class="row"><span>Date:</span><span>${formattedDate}</span></div>
          <div class="row"><span>Customer:</span><span>${order.orderFor || "Guest"}</span></div>
          <div class="row"><span>Table:</span><span>${order.tableName || order.tableId || "-"}</span></div>
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div class="row total-row"><span>Total Paid (Wallet):</span><span>${formattedAmount}</span></div>
          <div class="divider"></div>
          <div class="text-center" style="font-size: 11px; margin-top: 15px; color: #666;">
            Thank you for your order!<br/>Enjoy your coffee.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoading && !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={300} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link to="/my-transaction">
          <Button variant="primary">Return to History</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 sm:px-6 space-y-8 max-w-4xl">
        <PageHeader
          title={`Receipt: Order #${order.id}`}
          subtitle="View order status breakdown, itemized bill, and share ratings with our baristas."
          breadcrumb={[
            { label: "Home", to: "/" },
            { label: "My Transactions", to: "/my-transaction" },
            { label: `Order #${order.id}` },
          ]}
          action={
            <div className="flex gap-2">
              <Link to="/my-transaction">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<HiOutlineArrowLeft />}
                >
                  Back
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<HiOutlineDownload />}
                onClick={handleDownloadReceipt}
              >
                Receipt
              </Button>
            </div>
          }
        />

        {/* Status & Delivery Summary */}
        <Card variant="dashboard" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400">
                Current Order Progress
              </span>
              <div>
                <OrderStatusBadge status={order.orderStatus} size="md" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <HiOutlineClock className="text-amber-500 text-base" />
              <span>Placed on {formatDateTime(order.createdAt)}</span>
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
                  {order.orderFor || "Member Guest"}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Ordered Items List & Ratings */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Items in this Order
          </h3>

          <div className="space-y-3">
            {order.details?.map((item: OrderDetailItem, idx: number) => (
              <Card key={idx} variant="default" className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.photo || DummyProduct}
                      alt={item.menuName}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          DummyProduct;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.qty}x {item.menuName}
                      </h4>
                      {item.notes && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md w-fit">
                          Note: {item.notes}
                        </p>
                      )}
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                        {formatCurrency(item.price * item.qty)}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Action */}
                  <div className="space-y-1 text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {item.rating ? "Your Rating" : "Rate this item"}
                    </span>
                    <Rating
                      rating={item.rating || 0}
                      readonly={
                        !!item.rating ||
                        order.orderStatus !== 2 ||
                        submittingRatingId === item.id
                      }
                      onRate={(rate) => {
                        if (item.id) {
                          handleRateProduct(item.id, rate);
                        }
                      }}
                      size="md"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Total Payment Box */}
        <Card
          variant="elevated"
          className="p-6 space-y-3 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20"
        >
          <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
            <span>Total Paid via Wallet</span>
            <span className="text-2xl text-amber-600 dark:text-amber-400">
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DetailTransactionPage;
