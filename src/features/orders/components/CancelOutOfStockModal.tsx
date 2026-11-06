import React, { useState } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export interface CancelOutOfStockModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason: string; notes?: string }) => void | Promise<void>;
  orderId: number;
  totalPrice: number;
  paymentMethod?: string;
  paymentStatus?: string;
  loading?: boolean;
}

const CANCEL_REASONS = [
  { value: "STOCK_MISCALCULATION", label: "Physical stock depleted / Stock miscalculation" },
  { value: "DAMAGED_OR_SPOILED", label: "Ingredient spoiled, expired, or dropped" },
  { value: "EQUIPMENT_FAILURE", label: "Espresso machine / Grinder malfunction" },
  { value: "OTHER", label: "Other operational shortage" },
];

export const CancelOutOfStockModal: React.FC<CancelOutOfStockModalProps> = ({
  show,
  onClose,
  onConfirm,
  orderId,
  totalPrice,
  paymentMethod,
  paymentStatus,
  loading = false,
}) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0].value);
  const [notes, setNotes] = useState("");

  const isWalletPayment =
    paymentStatus?.toUpperCase() === "PAID" &&
    (paymentMethod?.toUpperCase() === "WALLET" || paymentMethod?.toUpperCase() === "E-WALLET");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ reason, notes: notes.trim() || undefined });
  };

  return (
    <Modal show={show} handleClose={onClose} size="md" title={`Cancel Order #${orderId} (Out of Stock)`}>
      <form onSubmit={handleSubmit} className="space-y-5 py-1">
        {/* Warning Callout */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex gap-3 items-start">
          <HiOutlineExclamationCircle className="text-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Missing Ingredients / Stock Incident</p>
            <p className="leading-relaxed">
              Cancelling this order marks the ticket as Out-of-Stock.
              {isWalletPayment ? (
                <>
                  {" "}The order amount of{" "}
                  <strong className="underline">{formatCurrency(totalPrice)}</strong> will be{" "}
                  <strong>instantly refunded</strong> back to the customer&apos;s wallet balance.
                </>
              ) : (
                <>
                  {" "}Total order amount is <strong>{formatCurrency(totalPrice)}</strong>. Please ensure any physical cash is returned to the guest if already accepted.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Reason Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Cancellation Reason <span className="text-red-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            {CANCEL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Operational Incident Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            placeholder="e.g. Fresh milk carton spoiled or oat milk ran out during peak hour..."
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Keep Order
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
            loading={loading}
          >
            Confirm Cancellation & Refund
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CancelOutOfStockModal;
