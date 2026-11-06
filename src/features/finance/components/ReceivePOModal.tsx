import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import type { PurchaseOrder } from "../types/finance.types.ts";

export interface ReceivePOModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (payload: { id: string; items?: { ingredient_id: string; quantity: number }[] }) => void | Promise<void>;
  purchase: PurchaseOrder | null;
  loading?: boolean;
}

export const ReceivePOModal: React.FC<ReceivePOModalProps> = ({
  show,
  onClose,
  onConfirm,
  purchase,
  loading = false,
}) => {
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    if (purchase && Array.isArray(purchase.items)) {
      const initial: Record<string, number> = {};
      purchase.items.forEach((item) => {
        initial[item.ingredient_id] = Number(item.quantity);
      });
      setReceivedQtys(initial);
    }
  }, [purchase]);

  if (!purchase) return null;

  const items = purchase.items || [];
  const isPartial = items.some(
    (item) => (receivedQtys[item.ingredient_id] ?? Number(item.quantity)) < Number(item.quantity)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payloadItems = items.map((it) => ({
      ingredient_id: it.ingredient_id,
      quantity: Number(receivedQtys[it.ingredient_id] ?? it.quantity),
    }));
    onConfirm({ id: purchase.id, items: payloadItems });
  };

  return (
    <Modal show={show} handleClose={onClose} size="md" title={`Receive Purchase Order - ${purchase.po_number}`}>
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Callout status */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex gap-3 items-start ${
            isPartial
              ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
          }`}
        >
          {isPartial ? (
            <HiOutlineExclamationCircle className="text-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <HiOutlineCheckCircle className="text-xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-bold">
              {isPartial ? "Partial Delivery Receiving" : "Full Delivery Receiving"}
            </p>
            <p className="leading-relaxed">
              {isPartial
                ? "Some quantities are less than ordered. Stock will be replenished for the received amounts, and the PO status will become PARTIALLY_RECEIVED."
                : "All items received in full. Stock will be replenished 100% and PO status will become RECEIVED."}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((item) => {
            const currentReceived = receivedQtys[item.ingredient_id] ?? Number(item.quantity);
            const orderedQty = Number(item.quantity);

            return (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {item.ingredient_name}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Ordered: {orderedQty} {item.unit} ({formatCurrency(item.unit_cost)} / {item.unit})
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold text-slate-500">Received:</span>
                  <input
                    type="number"
                    min="0"
                    max={orderedQty}
                    step="any"
                    value={currentReceived}
                    onChange={(e) =>
                      setReceivedQtys((prev) => ({
                        ...prev,
                        [item.ingredient_id]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-20 px-2 py-1 text-center font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <span className="text-slate-500 text-[11px]">{item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Confirm Receiving & Replenish Stock
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceivePOModal;
