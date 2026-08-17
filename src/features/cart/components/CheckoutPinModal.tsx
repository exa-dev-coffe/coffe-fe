import React, {useState} from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import {HiOutlineShieldCheck} from "react-icons/hi";

export interface CheckoutPinModalProps {
    show: boolean;
    totalAmount: number;
    tableName: string;
    orderFor: string;
    onClose: () => void;
    onConfirm: (pin: string) => Promise<boolean>;
    loading?: boolean;
}

export const CheckoutPinModal: React.FC<CheckoutPinModalProps> = ({
    show,
    totalAmount,
    tableName,
    orderFor,
    onClose,
    onConfirm,
    loading = false,
}) => {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
        setPin(val);
        if (error) setError("");
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 6) {
            setError("Please enter your 6-digit wallet PIN");
            return;
        }

        const success = await onConfirm(pin);
        if (!success) {
            setPin("");
        }
    };

    return (
        <Modal show={show} handleClose={onClose} size="sm" title="Confirm Payment PIN">
            <form onSubmit={handleFormSubmit} className="space-y-6 py-2">
                {/* Payment Overview Box */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                    <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                        Total Amount Due
                    </span>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {formatCurrency(totalAmount)}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-500/20">
                        <span>Table: #{tableName || "N/A"}</span>
                        <span>•</span>
                        <span>Name: {orderFor || "Guest"}</span>
                    </div>
                </div>

                {/* 6-Digit PIN Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center">
                        Enter 6-Digit Wallet PIN
                    </label>
                    <div className="relative max-w-xs mx-auto">
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="••••••"
                            autoFocus
                            value={pin}
                            onChange={handlePinChange}
                            className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    {error && <p className="text-xs text-rose-500 text-center font-medium">{error}</p>}
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
                    <HiOutlineShieldCheck className="text-emerald-500 text-base" />
                    <span>Protected by Diskusi Secure PIN Gateway</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={loading}
                        disabled={pin.length !== 6}
                        className="flex-1"
                    >
                        Pay & Order
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CheckoutPinModal;
