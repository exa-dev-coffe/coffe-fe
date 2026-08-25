import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Input from "@/components/ui/Input.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import { useGeneratePosCodeMutation } from "@/features/wallet/hooks/useWallet.ts";
import type { GeneratePosCodeResponse } from "@/features/wallet/types/wallet.types.ts";
import {
  HiOutlineKey,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineClipboardCopy,
  HiCheck,
} from "react-icons/hi";

export interface PosPaymentCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
}

export const PosPaymentCodeModal: React.FC<PosPaymentCodeModalProps> = ({
  isOpen,
  onClose,
  currentBalance = 0,
}) => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [codeData, setCodeData] = useState<GeneratePosCodeResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [copied, setCopied] = useState(false);

  const generateCodeMutation = useGeneratePosCodeMutation();

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setPin("");
      setPinError("");
      setCodeData(null);
      setTimeLeft(300);
      setCopied(false);
    }
  }, [isOpen]);

  // Countdown timer when code is generated
  useEffect(() => {
    if (!codeData || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [codeData, timeLeft]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
      setPinError("PIN must be exactly 6 digits");
      return;
    }
    setPinError("");

    try {
      const data = await generateCodeMutation.mutateAsync(pin);
      setCodeData(data);
      setTimeLeft(data.expiresInSeconds || 300);
    } catch {
      // Error handled by mutation
    }
  };

  const handleCopy = () => {
    if (!codeData) return;
    navigator.clipboard.writeText(codeData.paymentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Modal
      show={isOpen}
      handleClose={onClose}
      size="md"
      title="Pay at Cashier (POS Code)"
    >
      <div className="space-y-6">
        {!codeData ? (
          /* Step 1: PIN Input Form */
          <form onSubmit={handleGenerate} className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl border border-amber-500/20">
                <HiOutlineKey />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Authorize Payment Code
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your 6-digit Wallet PIN to generate a secure one-time cashier payment code.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-500">Available Balance:</span>
              <span className="font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(currentBalance)}
              </span>
            </div>

            <div className="space-y-1.5">
              <Input
                label="6-Digit Wallet PIN"
                type="password"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="• • • • • •"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(val);
                  if (pinError) setPinError("");
                }}
                error={pinError}
                autoFocus
                className="text-center tracking-widest text-lg font-black"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="w-1/2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={generateCodeMutation.isPending}
                disabled={pin.length !== 6 || generateCodeMutation.isPending}
                className="w-1/2"
              >
                Generate Code
              </Button>
            </div>
          </form>
        ) : (
          /* Step 2: Display Dynamic 6-Digit Payment Code */
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <HiOutlineShieldCheck className="text-sm" />
                <span>Active Payment Code</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Present this 6-digit code to the cashier operator:
              </p>
            </div>

            {/* Big 6-Digit Code Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900/10 dark:from-amber-950/40 dark:to-slate-900/40 border-2 border-amber-500/30 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl sm:text-5xl font-black tracking-wider text-slate-900 dark:text-white font-mono">
                  {codeData.paymentCode.slice(0, 3)} {codeData.paymentCode.slice(3)}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Code"
                  className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors"
                >
                  {copied ? (
                    <HiCheck className="text-emerald-500 text-lg" />
                  ) : (
                    <HiOutlineClipboardCopy className="text-lg" />
                  )}
                </button>
              </div>

              {/* Timer Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <HiOutlineClock className="text-amber-500" />
                    Expires In
                  </span>
                  <span
                    className={`font-black font-mono ${
                      timeLeft < 60
                        ? "text-rose-500 animate-pulse"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {formatMinutes(timeLeft)}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft < 60 ? "bg-rose-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${(timeLeft / 300) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Expired Warning or Refresh */}
            {timeLeft <= 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-rose-500 font-bold">
                  Payment code has expired for your security.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setCodeData(null);
                    setPin("");
                  }}
                  leftIcon={<HiOutlineRefresh />}
                  className="w-full"
                >
                  Generate New Code
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">
                  This one-time token will be automatically burned as soon as the cashier processes the transaction.
                </p>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PosPaymentCodeModal;
