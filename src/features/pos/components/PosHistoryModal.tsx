import React from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import type { OrderItem } from "@/features/orders/types/order.types.ts";
import type { PosReceiptData } from "@/features/pos/types/pos.types.ts";
import {
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlinePrinter,
  HiOutlineQrcode,
  HiOutlineSwitchHorizontal,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

interface PosHistoryModalProps {
  show: boolean;
  onClose: () => void;
  orders: OrderItem[];
  pagination?: {
    totalData: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    lastPage: boolean;
  };
  page?: number;
  onPageChange?: (page: number) => void;
  filterTab?: "ALL" | "PENDING" | "PAID";
  onFilterTabChange?: (tab: "ALL" | "PENDING" | "PAID") => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isLoading?: boolean;
  onRefresh: () => void;
  onSyncQris: (orderId: number) => Promise<unknown>;
  isSyncingId?: number | null;
  onShowQris?: (order: OrderItem) => void;
  onChangePaymentMethod?: (order: OrderItem) => void;
  onViewReceipt: (receiptData: PosReceiptData) => void;
}

export const PosHistoryModal: React.FC<PosHistoryModalProps> = ({
  show,
  onClose,
  orders,
  pagination,
  page: _page = 1,
  onPageChange,
  filterTab = "ALL",
  onFilterTabChange,
  searchQuery = "",
  onSearchChange,
  isLoading = false,
  onRefresh,
  onSyncQris,
  isSyncingId = null,
  onShowQris,
  onChangePaymentMethod,
  onViewReceipt,
}) => {
  const pendingCount = orders.filter(
    (o) => o.paymentStatus === "PENDING" || o.paymentStatus === "pending"
  ).length;

  const filteredOrders = orders.filter((order) => {
    const isPending =
      order.paymentStatus === "PENDING" || order.paymentStatus === "pending";
    const isPaid =
      order.paymentStatus === "PAID" || order.paymentStatus === "paid";

    if (filterTab === "PENDING" && !isPending) return false;
    if (filterTab === "PAID" && !isPaid) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId: boolean = order.id.toString().includes(q);
      const customerNameStr: string = (order.orderBy || order.orderFor || "").toLowerCase();
      const matchCustomer: boolean = customerNameStr.includes(q);
      const methodStr: string = (order.paymentMethod || "").toLowerCase();
      const matchMethod: boolean = methodStr.includes(q);
      return matchId || matchCustomer || matchMethod;
    }

    return true;
  });

  const handleSyncClick = async (orderId: number) => {
    await onSyncQris(orderId);
  };

  const handleReceiptClick = (order: OrderItem) => {
    const receiptData: PosReceiptData = {
      orderId: order.id,
      orderFor: order.orderBy || order.orderFor || "Walk-in Guest",
      orderType: order.orderType === "TAKEAWAY" ? "TAKEAWAY" : "DINE_IN",
      tableId: order.tableId || undefined,
      tableName: order.tableId ? `${order.tableId}` : undefined,
      cashierName: "Cashier Operator",
      createdAt: order.createdAt || new Date().toISOString(),
      items: order.details
        ? order.details.map((d: { menuId?: number; menuName?: string; name?: string; price?: number; qty?: number; totalPrice?: number; notes?: string }) => ({
            menuId: d.menuId || 0,
            name: d.menuName || d.name || `Item #${d.menuId}`,
            price: d.price || 0,
            qty: d.qty || 1,
            total: d.totalPrice || (d.price || 0) * (d.qty || 1),
            notes: d.notes || "",
          }))
        : [],
      subtotal: order.totalPrice || 0,
      productDiscount: 0,
      voucherDiscount: order.discountAmount || 0,
      totalPrice: order.totalPrice || 0,
      paymentMethod: order.paymentMethod === "MIDTRANS" ? "MIDTRANS" : order.paymentMethod === "WALLET" ? "WALLET" : "CASH",
      paymentStatus: order.paymentStatus || "PAID",
      cashAmount: order.cashAmount || order.totalPrice || 0,
      cashChange: order.cashChange || 0,
    };
    onViewReceipt(receiptData);
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      size="xl"
      title="POS Transaction History"
    >
      <div className="space-y-4 py-1">
        {/* Top Controls: Tabs, Search & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onFilterTabChange && onFilterTabChange("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === "ALL"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => onFilterTabChange && onFilterTabChange("PENDING")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === "PENDING"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <HiOutlineClock className="text-sm" />
              <span>Pending QRIS</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white animate-pulse font-mono">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onFilterTabChange && onFilterTabChange("PAID")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterTab === "PAID"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Paid
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search order..."
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Orders"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 transition-all cursor-pointer"
            >
              <HiOutlineRefresh
                className={`text-sm ${isLoading ? "animate-spin text-amber-500" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="max-h-[420px] overflow-y-auto space-y-2.5 pr-1">
          {isLoading && orders.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              Loading POS history...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              No orders found.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isPending =
                order.paymentStatus === "PENDING" ||
                order.paymentStatus === "pending";
              const isSyncing = isSyncingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:border-amber-500/50 transition-all"
                >
                  {/* Left Column: ID, OrderFor, Method */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                        #POS-{order.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.orderType === "TAKEAWAY"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {order.orderType || "DINE_IN"}
                      </span>
                      {isPending ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse flex items-center gap-1">
                          <HiOutlineClock /> PENDING QRIS
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <HiOutlineCheckCircle /> PAID
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Customer: <strong className="text-slate-800 dark:text-slate-200 font-bold">{order.orderBy || order.orderFor || "Walk-in Guest"}</strong></span>
                      {order.tableId ? (
                        <span>Table: <strong className="text-slate-800 dark:text-slate-200 font-bold">#{order.tableId}</strong></span>
                      ) : null}
                      <span>Method: <strong className="text-slate-800 dark:text-slate-200 font-bold">{order.paymentMethod || "CASH"}</strong></span>
                      <span>Time: <strong className="font-mono text-slate-600 dark:text-slate-400">{formatDateTime(order.createdAt)}</strong></span>
                    </div>
                  </div>

                  {/* Right Column: Amount & Action Buttons */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Total</span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                        {formatCurrency(order.totalPrice || 0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && onShowQris && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<HiOutlineQrcode />}
                          onClick={() => onShowQris(order)}
                          className="font-bold text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/80 dark:border-amber-500/30"
                        >
                          Show QR Code
                        </Button>
                      )}

                      {isPending && onChangePaymentMethod && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<HiOutlineSwitchHorizontal className="text-amber-500" />}
                          onClick={() => onChangePaymentMethod(order)}
                          className="font-bold text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        >
                          Change Method
                        </Button>
                      )}

                      {isPending && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<HiOutlineQrcode className={isSyncing ? "animate-spin" : ""} />}
                          disabled={isSyncing}
                          onClick={() => handleSyncClick(order.id)}
                          className="font-black text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20"
                        >
                          {isSyncing ? "Checking..." : "Check Status"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<HiOutlinePrinter />}
                        onClick={() => handleReceiptClick(order)}
                        className="font-bold text-xs"
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="text-slate-500 font-bold">
              Page <span className="text-amber-600 dark:text-amber-400 font-mono font-black">{pagination.currentPage}</span> of{" "}
              <span className="font-mono font-black">{pagination.totalPages}</span> ({pagination.totalData} total orders)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage <= 1 || isLoading}
                onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                leftIcon={<HiOutlineChevronLeft />}
                className="font-bold text-xs py-1 px-3"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.lastPage || pagination.currentPage >= pagination.totalPages || isLoading}
                onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                rightIcon={<HiOutlineChevronRight />}
                className="font-bold text-xs py-1 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PosHistoryModal;
