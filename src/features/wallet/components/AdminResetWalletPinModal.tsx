import React, { useState } from "react";
import Modal from "@/components/ui/Modal.tsx";
import InputIcon from "@/components/ui/InputIcon.tsx";
import Button from "@/components/ui/Button.tsx";
import {
  useAdminSendResetPinCodeMutation,
  useAdminResetPinMutation,
} from "@/features/wallet/hooks/useAdminWallet.ts";
import type { AdminWalletItem } from "@/features/wallet/types/adminWallet.types.ts";
import {
  HiOutlineMail,
  HiOutlineKey,
  HiOutlineShieldCheck,
  HiOutlinePaperAirplane,
} from "react-icons/hi";

interface AdminResetWalletPinModalProps {
  show: boolean;
  onClose: () => void;
  wallet: AdminWalletItem | null;
}

export const AdminResetWalletPinModal: React.FC<
  AdminResetWalletPinModalProps
> = ({ show, onClose, wallet }) => {
  const { mutateAsync: sendCode, isPending: sendingCode } =
    useAdminSendResetPinCodeMutation();
  const { mutateAsync: resetPin, isPending: resettingPin } =
    useAdminResetPinMutation();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    setError(null);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid customer email address");
      return;
    }

    try {
      await sendCode({ userId: wallet?.userId, email });
      setCodeSent(true);
    } catch {
      // Notification handled by hook
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codeSent) {
      setError("Please send the verification code to customer email first");
      return;
    }

    if (!code || code.trim().length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    if (!newPin || !/^\d{6}$/.test(newPin)) {
      setError("New PIN must be exactly 6 numeric digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PIN confirmation does not match");
      return;
    }

    try {
      await resetPin({
        userId: wallet?.userId,
        email,
        code: code.trim(),
        newPin: newPin.trim(),
      });
      onClose();
    } catch {
      // Notification handled by hook
    }
  };

  return (
    <Modal
      show={show}
      handleClose={onClose}
      title="Reset Customer Wallet PIN"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {wallet && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <HiOutlineKey className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                Customer Wallet #{wallet.id} (User ID: {wallet.userId})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Wallet No:{" "}
                {wallet.walletNumber
                  ? wallet.walletNumber.replace(/(.{4})/g, "$1 ").trim()
                  : `8839${String(wallet.userId).padStart(8, "0")}`}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Step 1: Input Email and Send Verification Code */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Customer Registered Email
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <InputIcon
                type="email"
                icon={<HiOutlineMail />}
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={codeSent}
                required
              />
            </div>
            <Button
              type="button"
              variant={codeSent ? "secondary" : "primary"}
              onClick={handleSendCode}
              loading={sendingCode}
              disabled={codeSent || !email}
              className="shrink-0 flex items-center gap-1 text-xs"
            >
              <HiOutlinePaperAirplane className="w-4 h-4" />
              {codeSent ? "Code Sent" : "Send Code"}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            A 6-digit OTP code will be sent to the customer's email address.
          </p>
        </div>

        {/* Step 2: Input Verification Code & New PIN */}
        {codeSent && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Verification Code (6 Digits from Email)
              </label>
              <InputIcon
                type="text"
                icon={<HiOutlineShieldCheck />}
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Transaction PIN
                </label>
                <InputIcon
                  type="password"
                  icon={<HiOutlineKey />}
                  placeholder="••••••"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New PIN
                </label>
                <InputIcon
                  type="password"
                  icon={<HiOutlineKey />}
                  placeholder="••••••"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, ""))
                  }
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={resettingPin}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={resettingPin}
            disabled={!codeSent || code.length !== 6 || newPin.length !== 6}
          >
            Reset PIN
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminResetWalletPinModal;
