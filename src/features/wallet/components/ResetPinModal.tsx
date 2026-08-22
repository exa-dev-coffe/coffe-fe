import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Input from "@/components/ui/Input.tsx";
import {
  HiOutlineKey,
  HiOutlineMail,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import {
  useChangePinMutation,
  useSendResetPinCodeMutation,
  useResetPinMutation,
} from "@/features/wallet/hooks/useWallet.ts";

export interface ResetPinModalProps {
  show: boolean;
  onClose: () => void;
}

export const ResetPinModal: React.FC<ResetPinModalProps> = ({
  show,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"change" | "reset">("change");

  // Change PIN State
  const [oldPin, setOldPin] = useState("");
  const [changeNewPin, setChangeNewPin] = useState("");
  const [changeConfirmPin, setChangeConfirmPin] = useState("");
  const [changeError, setChangeError] = useState("");

  // Reset PIN State
  const [codeSent, setCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpCode, setOtpCode] = useState("");
  const [resetNewPin, setResetNewPin] = useState("");
  const [resetConfirmPin, setResetConfirmPin] = useState("");
  const [resetError, setResetError] = useState("");

  const changePinMutation = useChangePinMutation();
  const sendResetPinCodeMutation = useSendResetPinCodeMutation();
  const resetPinMutation = useResetPinMutation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const resetForms = () => {
    setOldPin("");
    setChangeNewPin("");
    setChangeConfirmPin("");
    setChangeError("");
    setOtpCode("");
    setResetNewPin("");
    setResetConfirmPin("");
    setResetError("");
    setCodeSent(false);
    setResendTimer(0);
  };

  const handleCloseModal = () => {
    resetForms();
    onClose();
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");

    if (
      oldPin.length !== 6 ||
      changeNewPin.length !== 6 ||
      changeConfirmPin.length !== 6
    ) {
      setChangeError("All PIN fields must be exactly 6 digits.");
      return;
    }

    if (changeNewPin !== changeConfirmPin) {
      setChangeError("New PIN and Confirm PIN do not match.");
      return;
    }

    try {
      await changePinMutation.mutateAsync({ oldPin, newPin: changeNewPin });
      handleCloseModal();
    } catch {
      // Error notification is handled in mutation
    }
  };

  const handleSendCode = async () => {
    setResetError("");
    try {
      await sendResetPinCodeMutation.mutateAsync();
      setCodeSent(true);
      setResendTimer(60);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setResetError(
          "Maximum limit of verification code requests (3 times) for today has been reached.",
        );
      }
    }
  };

  const handleResetPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (otpCode.length !== 6) {
      setResetError("Verification code must be exactly 6 digits.");
      return;
    }

    if (resetNewPin.length !== 6 || resetConfirmPin.length !== 6) {
      setResetError("New PIN must be exactly 6 digits.");
      return;
    }

    if (resetNewPin !== resetConfirmPin) {
      setResetError("New PIN and Confirm PIN do not match.");
      return;
    }

    try {
      await resetPinMutation.mutateAsync({
        code: otpCode,
        newPin: resetNewPin,
      });
      handleCloseModal();
    } catch {
      // Error notification is handled in mutation
    }
  };

  return (
    <Modal
      show={show}
      handleClose={handleCloseModal}
      size="md"
      title="Transaction PIN Settings"
    >
      <div className="py-2 space-y-5">
        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("change");
              resetForms();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "change"
                ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <HiOutlineKey className="text-base" />
            Change PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("reset");
              resetForms();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "reset"
                ? "bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <HiOutlineMail className="text-base" />
            Forgot PIN (Email OTP)
          </button>
        </div>

        {/* Tab 1: Change PIN */}
        {activeTab === "change" && (
          <form onSubmit={handleChangePinSubmit} className="space-y-4">
            {changeError && (
              <div className="p-3 text-xs rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 font-medium">
                {changeError}
              </div>
            )}

            <Input
              label="Current 6-Digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter current PIN"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
              required
            />

            <Input
              label="New 6-Digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter new PIN"
              value={changeNewPin}
              onChange={(e) =>
                setChangeNewPin(e.target.value.replace(/\D/g, ""))
              }
              required
            />

            <Input
              label="Confirm New 6-Digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Re-enter new PIN"
              value={changeConfirmPin}
              onChange={(e) =>
                setChangeConfirmPin(e.target.value.replace(/\D/g, ""))
              }
              required
            />

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={changePinMutation.isPending}
                className="flex-1"
              >
                Change PIN
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Forgot PIN via Email */}
        {activeTab === "reset" && (
          <form onSubmit={handleResetPinSubmit} className="space-y-4">
            {resetError && (
              <div className="p-3 text-xs rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 font-medium">
                {resetError}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2 text-xs text-amber-900 dark:text-amber-300">
              <span className="font-semibold">
                Reset PIN via Verification Code
              </span>
              <span>
                Send a 6-digit OTP code to your registered email. Limited to{" "}
                <strong>max 3 times per day</strong>.
              </span>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSendCode}
                  disabled={
                    resendTimer > 0 || sendResetPinCodeMutation.isPending
                  }
                  loading={sendResetPinCodeMutation.isPending}
                >
                  {resendTimer > 0
                    ? `Resend Code in ${resendTimer}s`
                    : codeSent
                      ? "Resend Verification Code"
                      : "Send Verification Code to Email"}
                </Button>
              </div>
            </div>

            {codeSent && (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <HiOutlineCheckCircle className="text-base shrink-0" />
                Code sent! Please check your inbox or spam folder.
              </div>
            )}

            <Input
              label="6-Digit Verification Code (OTP)"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code from email"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              required
            />

            <Input
              label="New 6-Digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter new PIN"
              value={resetNewPin}
              onChange={(e) =>
                setResetNewPin(e.target.value.replace(/\D/g, ""))
              }
              required
            />

            <Input
              label="Confirm New 6-Digit PIN"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="Re-enter new PIN"
              value={resetConfirmPin}
              onChange={(e) =>
                setResetConfirmPin(e.target.value.replace(/\D/g, ""))
              }
              required
            />

            <div className="flex gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCloseModal}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={resetPinMutation.isPending}
                className="flex-1"
              >
                Reset PIN
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ResetPinModal;
