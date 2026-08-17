import React from "react";
import Card from "@/components/ui/Card.tsx";
import Badge from "@/components/ui/Badge.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
import { useSnapPayment } from "@/core/hooks/useSnapPayment.ts";

export interface WalletHistoryItemProps {
  id: string;
  amount: number;
  type: string;
  description?: string;
  orderId?: number;
  createdAt: string;
  status?: string;
  token?: string;
  isAnyPaying?: boolean;
  onPayStart?: () => void;
  onPayEnd?: () => void;
}

export const WalletHistoryItem: React.FC<WalletHistoryItemProps> = ({
  id,
  amount,
  type,
  description,
  orderId,
  createdAt,
  status,
  token,
  isAnyPaying,
  onPayStart,
  onPayEnd,
}) => {
  const { payWithSnap } = useSnapPayment();
  const isTopUp = type?.toUpperCase() === "TOPUP";
  const isPendingTopUp =
    isTopUp && status?.toUpperCase() === "PENDING" && token;

  const handlePayNow = async () => {
    if (token && window.snap) {
      if (onPayStart) onPayStart();
      try {
        await payWithSnap(token);
      } finally {
        if (onPayEnd) onPayEnd();
      }
    }
  };

  return (
    <Card
      variant="default"
      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
            isTopUp
              ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {isTopUp ? <HiOutlineArrowDown /> : <HiOutlineArrowUp />}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {isTopUp ? "Wallet Top Up" : "Coffee Order Payment"}
            </h4>
            <Badge variant={isTopUp ? "success" : "neutral"} size="sm">
              {type}
            </Badge>
            {status && (
              <Badge
                variant={
                  status.toUpperCase() === "COMPLETED"
                    ? "success"
                    : status.toUpperCase() === "PENDING"
                      ? "warning"
                      : "danger"
                }
                size="sm"
              >
                {status}
              </Badge>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {description ||
              (orderId
                ? `Order #${orderId}`
                : `Transaction #${id.substring(0, 8)}`)}
          </p>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatDateTime(createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
        <p
          className={`text-sm sm:text-base font-black ${
            isTopUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isTopUp
            ? `+${formatCurrency(amount)}`
            : `-${formatCurrency(amount)}`}
        </p>

        {isPendingTopUp && (
          <button
            onClick={handlePayNow}
            disabled={isAnyPaying}
            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center min-w-[72px]"
          >
            {isAnyPaying ? "Wait..." : "Pay Now"}
          </button>
        )}
      </div>
    </Card>
  );
};

export default WalletHistoryItem;
