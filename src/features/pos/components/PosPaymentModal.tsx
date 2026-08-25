import React, { useState, useEffect } from "react";
import type { PaymentMethod } from "@/features/pos/types/pos.types.ts";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineCash,
  HiOutlineQrcode,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineKey,
} from "react-icons/hi";

interface PosPaymentModalProps {
  show: boolean;
  onClose: () => void;
  totalAmount: number;
  orderFor: string;
  orderType: string;
  tableName?: string;
  onConfirmPayment: (
    method: PaymentMethod,
    cashAmount?: number,
    cashChange?: number,
    walletPaymentCode?: string
  ) => Promise<unknown>;
  isLoading: boolean;
  onManualSyncQris?: () => void;
  isSyncingQris?: boolean;
  initialMethod?: PaymentMethod;
  initialQrisData?: {
    orderId?: number;
    qrString?: string;
    qrUrl?: string;
  } | null;
}

const CASH_PRESETS = [20000, 50000, 100000, 200000, 500000];

export const PosPaymentModal: React.FC<PosPaymentModalProps> = ({
  show,
  onClose,
  totalAmount,
  orderFor,
  orderType,
  tableName,
  onConfirmPayment,
  isLoading,
  onManualSyncQris: _onManualSyncQris,
  isSyncingQris: _isSyncingQris = false,
  initialMethod,
  initialQrisData,
}) => {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashReceived, setCashReceived] = useState<number>(totalAmount);
  const [customInput, setCustomInput] = useState<string>("");
  const [walletCode, setWalletCode] = useState<string>("");
  const [walletCodeError, setWalletCodeError] = useState<string>("");

  const [qrisData, setQrisData] = useState<{
    orderId?: number;
    qrString?: string;
    qrUrl?: string;
  } | null>(null);
  void qrisData;

  useEffect(() => {
    if (show) {
      setMethod(initialMethod || "CASH");
      setCashReceived(totalAmount);
      setCustomInput(new Intl.NumberFormat("id-ID").format(totalAmount));
      setWalletCode("");
      setWalletCodeError("");
      setQrisData(initialQrisData || null);
    }
  }, [show, totalAmount, initialMethod, initialQrisData]);

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
      await onConfirmPayment("CASH", cashReceived, change);
    } else if (method === "WALLET") {
      if (walletCode.replace(/\s/g, "").length !== 6) {
        setWalletCodeError("Payment code must be exactly 6 digits");
        return;
      }
      setWalletCodeError("");
      await onConfirmPayment("WALLET", undefined, undefined, walletCode.replace(/\s/g, ""));
    } else if (method === "MIDTRANS") {
      await onConfirmPayment("MIDTRANS");
    }
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      size="md"
      title="Complete Cashier Checkout"
    >
      <div className="space-y-6 py-2">
        {/* Order Brief Summary Header */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              {orderType === "TAKEAWAY"
                ? "Takeaway Order"
                : `Dine-in (${tableName ? `Table #${tableName}` : "No Table"})`}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {orderFor || "Walk-in Guest"}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Amount
            </span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Method Switcher (3 Methods) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setMethod("CASH");
                setQrisData(null);
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                method === "CASH"
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-500/40"
              }`}
            >
              <HiOutlineCash className="text-xl text-amber-500" />
              <span>Cash (Tunai)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("WALLET");
                setQrisData(null);
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                method === "WALLET"
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-500/40"
              }`}
            >
              <HiOutlineCreditCard className="text-xl text-emerald-500" />
              <span>Customer Wallet</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod("MIDTRANS")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
                method === "MIDTRANS"
                  ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-500/40"
              }`}
            >
              <HiOutlineQrcode className="text-xl text-indigo-500" />
              <span>Midtrans (QRIS)</span>
            </button>
          </div>
        </div>

        {/* 1. CASH SECTION */}
        {method === "CASH" && (
          <div className="space-y-4 animate-fade-in">
            {/* Quick Cash Presets */}
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
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/50"
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
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/50"
                    }`}
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Cash Input */}
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

            {/* Change Result Box */}
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

        {/* 2. WALLET SECTION */}
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

        {/* 3. MIDTRANS SECTION */}
        {method === "MIDTRANS" && (
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4 animate-fade-in">
            <div className="space-y-3">
              <div className="w-36 h-36 mx-auto bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-indigo-500">
                <HiOutlineQrcode className="text-7xl" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">
                  Midtrans Dynamic QRIS Core API
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click the button below to generate a dynamic QRIS code. A dedicated QR code modal will open upon generation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
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
            {method === "CASH"
              ? "Complete Cash Order"
              : method === "WALLET"
              ? "Deduct Wallet Balance"
              : "Generate QRIS"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PosPaymentModal;
