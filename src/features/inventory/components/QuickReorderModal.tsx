import React, { useState, useEffect, useMemo } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import { HiOutlineShoppingCart, HiOutlineTrash } from "react-icons/hi";
import type { Ingredient } from "../types/inventory.types.ts";
import { useSuppliersQuery, useCreatePurchaseMutation } from "@/features/finance/hooks/useFinance.ts";

export interface QuickReorderModalProps {
  show: boolean;
  onClose: () => void;
  lowStockIngredients: Ingredient[];
  onSuccess?: () => void;
}

interface ReorderLineItem {
  ingredient_id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  quantity: number;
  unit_cost: number;
}

export const QuickReorderModal: React.FC<QuickReorderModalProps> = ({
  show,
  onClose,
  lowStockIngredients,
  onSuccess,
}) => {
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliersQuery();
  const { mutateAsync: createPurchase, isPending: creatingPO } = useCreatePurchaseMutation();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [poNotes, setPoNotes] = useState<string>("");
  const [lineItems, setLineItems] = useState<ReorderLineItem[]>([]);

  const supplierOptions: DropdownOption[] = useMemo(
    () =>
      suppliers.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.payment_terms || "NET 30"})`,
      })),
    [suppliers]
  );

  useEffect(() => {
    if (show && lowStockIngredients.length > 0) {
      if (suppliers.length > 0 && !selectedSupplierId) {
        setSelectedSupplierId(suppliers[0].id);
      }
      setPoNotes("Auto-generated reorder for low-stock ingredients");
      setLineItems(
        lowStockIngredients.map((ing) => {
          // Suggested qty = (min_stock * 2) - current_stock (at least 1)
          const suggested = Math.max(1, Number(ing.min_stock_alert) * 2 - Number(ing.current_stock));
          return {
            ingredient_id: ing.id,
            name: ing.name,
            unit: ing.unit,
            current_stock: Number(ing.current_stock),
            min_stock_alert: Number(ing.min_stock_alert),
            quantity: Math.round(suggested * 100) / 100,
            unit_cost: Number(ing.cost_per_unit) || 0,
          };
        })
      );
    }
  }, [show, lowStockIngredients, suppliers]);

  if (!show) return null;

  const totalEstAmount = lineItems.reduce((acc, curr) => acc + curr.quantity * curr.unit_cost, 0);

  const handleRemoveLine = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || lineItems.length === 0) return;

    await createPurchase({
      supplier_id: selectedSupplierId,
      notes: poNotes,
      items: lineItems.map((l) => ({
        ingredient_id: l.ingredient_id,
        quantity: Number(l.quantity),
        unit_cost: Number(l.unit_cost),
      })),
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <Modal show={show} handleClose={onClose} size="lg" title="Quick Reorder PO for Low-Stock Items">
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
          <p className="font-bold flex items-center gap-1.5">
            <HiOutlineShoppingCart className="text-base" /> Smart Inventory Replenishment
          </p>
          <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">
            Suggested reorder quantities are pre-calculated to bring depleted items back up to safety threshold levels.
          </p>
        </div>

        {/* Supplier selection */}
        <div>
          <Dropdown
            label="Target Supplier *"
            placeholder="Select vendor / supplier..."
            options={supplierOptions}
            value={supplierOptions.find((s) => s.value === selectedSupplierId) || null}
            setValue={(opt) => setSelectedSupplierId(opt?.value ? String(opt.value) : "")}
            required
            disabled={loadingSuppliers}
          />
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="px-3.5 py-2.5">Ingredient</th>
                  <th className="px-3.5 py-2.5">Current / Min</th>
                  <th className="px-3.5 py-2.5">Order Qty</th>
                  <th className="px-3.5 py-2.5">Est. Unit Cost</th>
                  <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                  <th className="px-2 py-2.5 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lineItems.map((line, idx) => {
                  const subtotal = line.quantity * line.unit_cost;
                  return (
                    <tr key={line.ingredient_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900 dark:text-white">
                        {line.name}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-400">
                        <span className="text-rose-500 font-bold">{line.current_stock}</span> /{" "}
                        {line.min_stock_alert} {line.unit}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={line.quantity || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setLineItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, quantity: val } : item))
                              );
                            }}
                            className="w-20 px-2 py-1 text-xs font-bold text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                          />
                          <span className="text-[11px] text-slate-400">{line.unit}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.unit_cost || ""}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setLineItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, unit_cost: val } : item))
                            );
                          }}
                          className="w-24 px-2 py-1 text-xs text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(subtotal)}
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                            title="Exclude from PO"
                          >
                            <HiOutlineTrash className="text-sm" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* PO Notes & Total */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="PO notes (optional)..."
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Est. PO</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(totalEstAmount)}
            </span>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={creatingPO}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={creatingPO}
            disabled={!selectedSupplierId || lineItems.length === 0}
          >
            Create Purchase Order
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickReorderModal;
