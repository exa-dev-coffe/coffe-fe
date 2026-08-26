import React from "react";
import { Link } from "react-router";
import Card from "@/components/ui/Card.tsx";
import Badge from "@/components/ui/Badge.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineExternalLink,
  HiOutlineDownload,
} from "react-icons/hi";

export interface WalletHistoryItemProps {
  id: string;
  amount: number;
  type: string;
  description?: string;
  orderId?: number;
  createdAt: string;
  status?: string;
  paymentType?: string;
  bank?: string;
  vaNumber?: string;
  qrUrl?: string;
  billKey?: string;
  userEmail?: string;
  userName?: string;
}

export const WalletHistoryItem: React.FC<WalletHistoryItemProps> = ({
  id,
  amount,
  type,
  description,
  orderId,
  createdAt,
  status,
  paymentType,
  bank,
  userEmail,
  userName,
}) => {
  const isTopUp = type?.toUpperCase() === "TOPUP";
  const isPendingTopUp = isTopUp && status?.toUpperCase() === "PENDING";
  const isCompletedTopUp = isTopUp && status?.toUpperCase() === "COMPLETED";

  const handleDownloadReceipt = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedAmount = formatCurrency(amount);
    const formattedDate = new Date(createdAt).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const htmlContent = `
      <html>
        <head>
          <title>Receipt-${id || 'topup'}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 320px;
              margin: 30px auto;
              color: #000;
              padding: 15px;
              border: 1px dashed #ccc;
            }
            .text-center {
              text-align: center;
            }
            .bold {
              font-weight: bold;
            }
            .title {
              font-size: 18px;
              margin: 12px 0 4px 0;
              font-weight: bold;
              letter-spacing: 1px;
            }
            .subtitle {
              font-size: 11px;
              margin-bottom: 15px;
              color: #444;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 12px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 6px;
            }
            .total-row {
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .footer {
              margin-top: 30px;
              font-size: 11px;
              text-align: center;
              line-height: 1.4;
            }
            @media print {
              body {
                margin: 0 auto;
                border: none;
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size: 26px; letter-spacing: 2px; color: #d97706;">COFFE</div>
            <div class="title">TOP-UP RECEIPT</div>
            <div class="subtitle">Digital Member Wallet</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Date:</span>
            <span>${formattedDate}</span>
          </div>
          <div class="row">
            <span>Ref ID:</span>
            <span style="font-size: 10px; font-family: monospace;">${id || '-'}</span>
          </div>
          <div class="row">
            <span>Customer:</span>
            <span>${userName || 'Member'}</span>
          </div>
          <div class="row">
            <span>Email:</span>
            <span style="font-size: 10px; font-family: monospace;">${userEmail || '-'}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Top-Up Amount</span>
            <span>${formattedAmount}</span>
          </div>
          <div class="row">
            <span>Admin Fee</span>
            <span>Rp 0</span>
          </div>
          <div class="row">
            <span>Payment Method</span>
            <span>${(paymentType || 'Core API').toUpperCase()} ${(bank || '').toUpperCase()}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row total-row">
            <span>TOTAL CREDITED</span>
            <span>${formattedAmount}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <div class="bold" style="color: #10b981; font-size: 13px; margin-bottom: 8px;">STATUS: SUCCESSFUL</div>
            <p style="margin: 0;">Thank you for your top up!</p>
            <p style="margin: 3px 0 0 0;">Enjoy your freshly brewed coffee at Coffe Shop.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
          <Link
            to={`/my-wallet/top-up?id=${id}`}
            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Pay Now</span>
            <HiOutlineExternalLink />
          </Link>
        )}

        {isCompletedTopUp && (
          <button
            onClick={handleDownloadReceipt}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            title="Download Receipt"
          >
            <span>Receipt</span>
            <HiOutlineDownload />
          </button>
        )}
      </div>
    </Card>
  );
};

export default WalletHistoryItem;

