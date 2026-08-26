import React, { useState, useEffect } from "react";
import type { PaymentMethod } from "@/features/pos/types/pos.types.ts";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineKey,
} from "react-icons/hi";

export interface PosChangePaymentData {
  orderId: number;
  orderFor: string;
  orderType: string;
  tableName?: string;
  totalPrice: number;
}

interface PosChangePaymentModalProps {
  show: boolean;
  onClose: () => void;
  data: PosChangePaymentData | null;
  onConfirmChangePayment: (
    orderId: number,
    method: PaymentMethod,
    cashAmount?: number,
    cashChange?: number,
    walletPaymentCode?: string
  ) => Promise<unknown>;
  isLoading: boolean;
}

const CASH_PRESETS = [20000, 50000, 100000, 200000, 500000];

export const PosChangePaymentModal: React.FC<PosChangePaymentModalProps> = ({
  show,
  onClose,
  data,
  onConfirmChangePayment,
  isLoading,
}) => {
  const [method, setMethod] = useState<"CASH" | "WALLET">("CASH");
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>("");
  const [walletCode, setWalletCode] = useState<string>("");
  const [walletCodeError, setWalletCodeError] = useState<string>("");

  useEffect(() => {
    if (show && data) {
      setMethod("CASH");
      setCashReceived(data.totalPrice);
      setCustomInput(new Intl.NumberFormat("id-ID").format(data.totalPrice));
      setWalletCode("");
      setWalletCodeError("");
    }
  }, [show, data]);

  if (!data) return null;

  const totalAmount = data.totalPrice;
  const change = Math.max(0, cashReceived - totalAmount);
  const isCashSufficient = cashReceived >= totalAmount;

  const handleSelectPreset = (amount: number) => {
    setCashReceived(amount);
    setCustomInput(new Intl.NumberFormat("id-ID").format(amount));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      setCustomInput("");
      setCashReceived(0);
      return;
    }
    const num = Number(val);
    setCustomInput(new Intl.NumberFormat("id-ID").format(num));
    setCashReceived(num);
  };

  const handleSubmit = async () => {
    if (method === "CASH") {
      if (!isCashSufficient) return;
      await onConfirmChangePayment(data.orderId, "CASH", cashReceived, change);
    } else if (method === "WALLET") {
      if (walletCode.replace(/\s/g, "").length !== 6) {
        setWalletCodeError("Payment code must be exactly 6 digits");
        return;
      }
      setWalletCodeError("");
      await onConfirmChangePayment(
        data.orderId,
        "WALLET",
        undefined,
        undefined,
        walletCode.replace(/\s/g, "")
      );
    }
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      size="md"
      title={`Change Payment Method — Order #POS-${data.orderId}`}
    >
      <div className="space-y-6 py-2">
        {/* Header Summary */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
              {data.orderType === "TAKEAWAY"
                ? "Takeaway Order"
                : `Dine-in (${data.tableName ? `Table #${data.tableName}` : "No Table"})`}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {data.orderFor || "Walk-in Guest"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Payable
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Method Selector (Cash vs Wallet) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Select New Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("CASH")}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                method === "CASH"
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-md scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <HiOutlineCash className="text-xl text-amber-500" />
              <span>Cash Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("WALLET")}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                method === "WALLET"
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-md scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <HiOutlineCreditCard className="text-xl text-emerald-500" />
              <span>Customer Wallet</span>
            </button>
          </div>
        </div>

        {/* CASH Form */}
        {method === "CASH" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(totalAmount)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    cashReceived === totalAmount
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Exact Amount
                </button>
                {CASH_PRESETS.filter((p) => p >= totalAmount).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      cashReceived === preset
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Cash Received
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-base">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customInput}
                  onChange={handleCustomChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-white font-black text-xl"
                  autoFocus
                />
              </div>
            </div>

            {isCashSufficient ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold block text-emerald-900 dark:text-emerald-200">
                      Change Due
                    </span>
                    <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                      Return this amount to the customer
                    </span>
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(change)}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-2 text-xs font-bold">
                <HiOutlineExclamation className="text-lg shrink-0" />
                <span>
                  Insufficient cash received. Short by {formatCurrency(totalAmount - cashReceived)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* WALLET Form */}
        {method === "WALLET" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <HiOutlineKey className="text-base" />
                <span>One-Time Payment Code (6-Digit Token)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Ask the customer to open <strong>My Wallet $\rightarrow$ Pay at Cashier</strong> in their app and provide the generated 6-digit code.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Enter 6-Digit Payment Code
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 839201"
                value={walletCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setWalletCode(val);
                  if (walletCodeError) setWalletCodeError("");
                }}
                className="w-full text-center py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-white font-mono font-black text-2xl tracking-widest"
                autoFocus
              />
              {walletCodeError && (
                <p className="text-xs text-rose-500 font-bold">{walletCodeError}</p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={isLoading}
            disabled={
              isLoading ||
              (method === "CASH" && !isCashSufficient) ||
              (method === "WALLET" && walletCode.length !== 6)
            }
            onClick={handleSubmit}
            className="font-black bg-amber-500 hover:bg-amber-600 text-white"
          >
            {method === "CASH" ? "Complete Cash Order" : "Deduct Wallet Balance"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PosChangePaymentModal;
