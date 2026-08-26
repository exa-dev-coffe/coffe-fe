import React from "react";
import type { PosReceiptData } from "@/features/pos/types/pos.types.ts";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlinePrinter,
  HiOutlinePlus,
  HiOutlineCheckCircle,
} from "react-icons/hi";

interface PosReceiptModalProps {
  show: boolean;
  receiptData: PosReceiptData | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const PosReceiptModal: React.FC<PosReceiptModalProps> = ({
  show,
  receiptData,
  onClose,
  onNewOrder,
}) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = formatDateTime(receiptData.createdAt);

    const itemsHtml = receiptData.items
      .map(
        (item) => `
        <div class="item-row">
          <div class="item-header">
            <span class="item-name">${item.name}</span>
            <span class="item-total">${formatCurrency(item.total)}</span>
          </div>
          <div class="item-sub">
            <span>${item.qty} x ${formatCurrency(item.price)}</span>
            ${item.notes ? `<span class="item-note">(${item.notes})</span>` : ""}
          </div>
        </div>
      `
      )
      .join("");

    const printHtml = `
      <html>
        <head>
          <title>Receipt-#${receiptData.orderId}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 280px;
              margin: 20px auto;
              color: #000;
              padding: 10px;
              font-size: 11px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .title { font-size: 16px; font-weight: bold; margin: 4px 0; letter-spacing: 1px; }
            .subtitle { font-size: 10px; color: #333; margin-bottom: 8px; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .item-row { margin-bottom: 6px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; }
            .item-sub { display: flex; justify-content: space-between; font-size: 10px; color: #444; }
            .item-note { font-style: italic; color: #666; font-size: 9px; }
            .total-row { font-size: 13px; font-weight: bold; margin-top: 6px; }
            .footer { margin-top: 20px; text-align: center; font-size: 10px; line-height: 1.4; }
            @media print {
              body { margin: 0 auto; padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="text-center">
            <div class="bold" style="font-size: 20px; letter-spacing: 2px;">DISKUSI COFFEE</div>
            <div class="subtitle">Specialty Coffee & Roastery</div>
            <div>Order #${receiptData.orderId}</div>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Date:</span>
            <span>${formattedDate}</span>
          </div>
          <div class="row">
            <span>Cashier:</span>
            <span>${receiptData.cashierName}</span>
          </div>
          <div class="row">
            <span>Customer:</span>
            <span>${receiptData.orderFor}</span>
          </div>
          <div class="row">
            <span>Type:</span>
            <span class="bold">${receiptData.orderType === "TAKEAWAY" ? "TAKEAWAY (Bawa Pulang)" : `DINE-IN ${receiptData.tableName ? `(Table #${receiptData.tableName})` : ""}`}</span>
          </div>
          
          <div class="divider"></div>
          
          ${itemsHtml}
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Subtotal</span>
            <span>${formatCurrency(receiptData.subtotal)}</span>
          </div>
          ${receiptData.productDiscount > 0 ? `
            <div class="row">
              <span>Product Discount</span>
              <span>-${formatCurrency(receiptData.productDiscount)}</span>
            </div>
          ` : ""}
          ${receiptData.voucherDiscount > 0 ? `
            <div class="row">
              <span>Voucher (${receiptData.voucherCode || "PROMO"})</span>
              <span>-${formatCurrency(receiptData.voucherDiscount)}</span>
            </div>
          ` : ""}
          <div class="row">
            <span>Tax & Service</span>
            <span>Included</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row total-row">
            <span>TOTAL</span>
            <span>${formatCurrency(receiptData.totalPrice)}</span>
          </div>
          
          <div class="divider"></div>
          
          <div class="row">
            <span>Payment Method:</span>
            <span class="bold">${receiptData.paymentMethod}</span>
          </div>
          ${receiptData.paymentMethod === "CASH" ? `
            <div class="row">
              <span>Cash Received:</span>
              <span>${formatCurrency(receiptData.cashAmount)}</span>
            </div>
            <div class="row">
              <span>Cash Change:</span>
              <span class="bold">${formatCurrency(receiptData.cashChange)}</span>
            </div>
          ` : ""}
          
          <div class="footer">
            <div class="bold">*** PAID ***</div>
            <p>Thank you for your order!</p>
            <p>Enjoy your freshly brewed coffee.</p>
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

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <Modal show={show} handleClose={onClose} size="md" title="Order Receipt">
      <div className="space-y-6 py-2">
        {/* Success Alert */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HiOutlineCheckCircle className="text-2xl text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="text-xs font-bold block text-emerald-950 dark:text-emerald-100">
                Order #${receiptData.orderId} Placed Successfully!
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Order ticket has been sent to Barista queue.
              </span>
            </div>
          </div>
        </div>

        {/* Thermal Receipt Paper Card */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 max-w-sm mx-auto shadow-inner space-y-4 font-mono text-xs">
          {/* Cafe Header */}
          <div className="text-center space-y-0.5">
            <h4 className="text-base font-black text-slate-900 dark:text-white tracking-widest">
              DISKUSI COFFEE
            </h4>
            <p className="text-[10px] text-slate-500">Specialty Coffee & Roastery</p>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Order #{receiptData.orderId}
            </span>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatDateTime(receiptData.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {receiptData.cashierName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {receiptData.orderFor}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-black text-amber-600 dark:text-amber-400">
                {receiptData.orderType === "TAKEAWAY"
                  ? "TAKEAWAY"
                  : `DINE-IN ${receiptData.tableName ? `(#${receiptData.tableName})` : ""}`}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-3 space-y-2">
            {receiptData.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 text-xs">
                  <span>{item.name}</span>
                  <span>{formatCurrency(item.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>
                    {item.qty} x {formatCurrency(item.price)}
                  </span>
                  {item.notes && <span className="italic">({item.notes})</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-slate-300 dark:border-slate-800 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(receiptData.subtotal)}</span>
            </div>
            {receiptData.productDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Product Promo</span>
                <span>-{formatCurrency(receiptData.productDiscount)}</span>
              </div>
            )}
            {receiptData.voucherDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Voucher ({receiptData.voucherCode || "PROMO"})</span>
                <span>-{formatCurrency(receiptData.voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-300 dark:border-slate-800">
              <span>TOTAL PAID</span>
              <span className="text-amber-600 dark:text-amber-400">
                {formatCurrency(receiptData.totalPrice)}
              </span>
            </div>

            <div className="pt-2 text-[11px] space-y-0.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {receiptData.paymentMethod === "WALLET"
                    ? "Digital Wallet"
                    : receiptData.paymentMethod === "MIDTRANS"
                    ? "QRIS (Midtrans)"
                    : "Cash (Tunai)"}
                </span>
              </div>
              {receiptData.paymentMethod === "CASH" && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(receiptData.cashAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Change:</span>
                    <span>{formatCurrency(receiptData.cashChange)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            size="md"
            leftIcon={<HiOutlinePrinter />}
            onClick={handlePrint}
            className="w-full sm:w-auto font-bold"
          >
            Print Receipt
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<HiOutlinePlus />}
            onClick={() => {
              onNewOrder();
              onClose();
            }}
            className="w-full sm:w-auto font-black shadow-lg shadow-amber-500/25"
          >
            New Order (Next Customer)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PosReceiptModal;
