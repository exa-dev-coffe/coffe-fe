import React, { useState } from "react";
import type { PosCartItem, OrderType } from "@/features/pos/types/pos.types.ts";
import type { TableItem } from "@/features/tables/types/table.types.ts";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import VoucherPickerModal from "@/features/cart/components/VoucherPickerModal.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineShoppingBag,
  HiOutlineDesktopComputer,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlinePencilAlt,
  HiOutlineTicket,
  HiOutlineArrowRight,
  HiOutlineCheck,
} from "react-icons/hi";

interface PosCartPanelProps {
  items: PosCartItem[];
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  selectedTableId: number | null;
  selectedTableName?: string;
  onSelectTable: (tableId: number | null, tableName?: string) => void;
  tables: TableItem[];
  onUpdateQty: (id: number, delta: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onRemoveItem: (id: number) => void;
  appliedVoucher: {
    code: string;
    discountAmount: number;
    finalTotal: number;
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
  } | null;
  onApplyVoucherCode: (code: string) => void;
  onRemoveVoucher: () => void;
  voucherInput: string;
  onVoucherInputChange: (code: string) => void;
  isVoucherLoading?: boolean;
  onOpenPaymentModal: () => void;
}

export const PosCartPanel: React.FC<PosCartPanelProps> = ({
  items,
  orderType,
  onOrderTypeChange,
  customerName,
  onCustomerNameChange,
  selectedTableId,
  selectedTableName,
  onSelectTable,
  tables,
  onUpdateQty,
  onUpdateNotes,
  onRemoveItem,
  appliedVoucher,
  onApplyVoucherCode,
  onRemoveVoucher,
  voucherInput,
  onVoucherInputChange,
  isVoucherLoading,
  onOpenPaymentModal,
}) => {
  const [showTableModal, setShowTableModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const tableOptions: DropdownOption[] = tables.map((t) => ({
    value: t.id,
    label: `Table #${t.name}`,
  }));

  const [selectedDropdownTable, setSelectedDropdownTable] =
    useState<DropdownOption | null>(
      selectedTableId
        ? {
            value: selectedTableId,
            label: selectedTableName || `Table #${selectedTableId}`,
          }
        : null
    );

  const subtotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.amount,
    0
  );

  const productSavings = items.reduce(
    (sum, item) =>
      sum +
      (item.originalPrice && item.originalPrice > item.price
        ? (item.originalPrice - item.price) * item.amount
        : 0),
    0
  );

  const effectiveSubtotal = subtotal - productSavings;
  const voucherDiscount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalTotal = appliedVoucher
    ? appliedVoucher.finalTotal
    : Math.max(0, effectiveSubtotal - voucherDiscount);

  const handleStartEditNotes = (item: PosCartItem) => {
    setEditingNotesId(item.id);
    setTempNotes(item.notes || "");
  };

  const handleSaveNotes = (id: number) => {
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
    setTempNotes("");
  };

  const handleConfirmTable = () => {
    if (selectedDropdownTable) {
      onSelectTable(
        Number(selectedDropdownTable.value),
        selectedDropdownTable.label.replace("Table #", "")
      );
    } else {
      onSelectTable(null, undefined);
    }
    setShowTableModal(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xl shadow-slate-900/5 flex flex-col h-full space-y-4">
      {/* 1. Header & Order Type Switcher */}
      <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Order Ticket
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300">
              {items.reduce((acc, i) => acc + i.amount, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onOrderTypeChange("DINE_IN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                orderType === "DINE_IN"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <HiOutlineDesktopComputer className="text-sm" />
              <span>Dine-In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onOrderTypeChange("TAKEAWAY");
                onSelectTable(null, undefined);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                orderType === "TAKEAWAY"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <HiOutlineShoppingBag className="text-sm" />
              <span>Takeaway</span>
            </button>
          </div>
        </div>

        {/* Customer & Table Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Customer Name..."
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
            />
          </div>

          {orderType === "DINE_IN" ? (
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              className={`flex items-center justify-between px-3 py-2 text-xs rounded-2xl transition-all font-bold cursor-pointer truncate ${
                !selectedTableId
                  ? "bg-red-500/15 border border-red-500/60 text-red-700 dark:text-red-300 animate-pulse"
                  : "bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <HiOutlineDesktopComputer className="text-amber-600 dark:text-amber-400 shrink-0 text-sm" />
                <span className="truncate">
                  {selectedTableName ? `Table #${selectedTableName}` : "Select Table *"}
                </span>
              </span>
              <span className="text-[10px] font-black underline shrink-0">
                {selectedTableName ? "Change" : "Required"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 rounded-2xl font-bold">
              <HiOutlineShoppingBag className="text-emerald-500 text-sm shrink-0" />
              <span>Bawa Pulang (No Table)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Items List (Scrollable) */}
      <div className="flex-1 overflow-y-auto space-y-2.5 min-h-[160px] pr-1">
        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <HiOutlineShoppingBag className="text-4xl mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-bold">Cart is empty</p>
            <p className="text-[11px] text-slate-400">
              Click products on the left menu to add to ticket.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const itemTotal = item.price * item.amount;
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2 group transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {item.nameProduct}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{formatCurrency(item.price)}</span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="line-through text-slate-400 text-[10px]">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatCurrency(itemTotal)}
                    </span>
                  </div>
                </div>

                {/* Quantity Stepper & Notes Bar */}
                <div className="flex items-center justify-between pt-1">
                  {/* Notes summary / trigger */}
                  <div className="flex-1 min-w-0 pr-2">
                    {editingNotesId === item.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Less ice, extra shot"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full px-2.5 py-1 text-[11px] bg-white dark:bg-slate-900 border border-amber-500 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(item.id)}
                          className="p-1 rounded-lg bg-amber-500 text-white text-xs hover:bg-amber-600 cursor-pointer"
                        >
                          <HiOutlineCheck />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEditNotes(item)}
                        className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer truncate max-w-full"
                      >
                        <HiOutlinePencilAlt className="text-xs shrink-0" />
                        <span className="truncate">
                          {item.notes ? item.notes : "Add note..."}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                    >
                      <HiOutlineMinus />
                    </button>
                    <span className="w-6 text-center font-black text-xs text-slate-900 dark:text-white">
                      {item.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                    >
                      <HiOutlinePlus />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="w-6 h-6 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors ml-0.5"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Promo Voucher Section */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        {appliedVoucher ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 uppercase tracking-wider font-mono">
                {appliedVoucher.code}
              </span>
              <span>-{formatCurrency(appliedVoucher.discountAmount)}</span>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="text-rose-500 hover:underline cursor-pointer text-[11px]"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Promo Voucher Code"
              value={voucherInput}
              onChange={(e) => onVoucherInputChange(e.target.value.toUpperCase())}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 uppercase font-black"
            />
            <Button
              variant="secondary"
              size="sm"
              loading={isVoucherLoading}
              disabled={!voucherInput.trim() || items.length === 0}
              onClick={() => onApplyVoucherCode(voucherInput.trim())}
              className="text-xs"
            >
              Apply
            </Button>
            <button
              type="button"
              onClick={() => setShowVoucherModal(true)}
              className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 cursor-pointer"
              title="Pick Voucher"
            >
              <HiOutlineTicket className="text-base" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Payment Totals Breakdown */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {productSavings > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Product Promo</span>
            <span>-{formatCurrency(productSavings)}</span>
          </div>
        )}

        {voucherDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Voucher Discount</span>
            <span>-{formatCurrency(voucherDiscount)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-black text-slate-900 dark:text-white">
            Total Charge
          </span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* 5. Checkout CTA Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        disabled={items.length === 0}
        rightIcon={<HiOutlineArrowRight />}
        onClick={() => {
          if (orderType === "DINE_IN" && !selectedTableId) {
            setShowTableModal(true);
            return;
          }
          onOpenPaymentModal();
        }}
        className="font-black text-sm py-3.5 shadow-lg shadow-amber-500/25"
      >
        Pay {formatCurrency(finalTotal)}
      </Button>

      {/* Table Selector Modal for Dine-in */}
      <Modal
        show={showTableModal}
        handleClose={() => setShowTableModal(false)}
        size="sm"
        title="Select Dine-in Table"
      >
        <div className="space-y-5 py-2">
          <Dropdown
            label="Table Number"
            placeholder="Choose table..."
            options={tableOptions}
            value={selectedDropdownTable}
            setValue={setSelectedDropdownTable}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTableModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmTable}>
              Confirm Table
            </Button>
          </div>
        </div>
      </Modal>

      {/* Voucher Selector Modal */}
      <VoucherPickerModal
        show={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        orderTotal={effectiveSubtotal}
        appliedVoucherCode={appliedVoucher?.code}
        onSelectVoucher={(code) => {
          onApplyVoucherCode(code);
          setShowVoucherModal(false);
        }}
        onRemoveVoucher={() => {
          onRemoveVoucher();
          setShowVoucherModal(false);
        }}
      />
    </div>
  );
};

export default PosCartPanel;
