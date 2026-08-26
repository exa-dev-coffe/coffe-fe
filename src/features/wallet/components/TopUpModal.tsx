import React, {useState} from "react";
import Modal from "@/components/ui/Modal.tsx";
import Button from "@/components/ui/Button.tsx";
import Input from "@/components/ui/Input.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import {HiOutlineCreditCard} from "react-icons/hi";

export interface TopUpModalProps {
    show: boolean;
    onClose: () => void;
    onTopUp: (amount: number) => Promise<boolean>;
    loading?: boolean;
}

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];

export const TopUpModal: React.FC<TopUpModalProps> = ({
    show,
    onClose,
    onTopUp,
    loading = false,
}) => {
    const [amount, setAmount] = useState<number>(50000);
    const [customInput, setCustomInput] = useState<string>("50.000");

    const handleSelectPreset = (val: number) => {
        setAmount(val);
        setCustomInput(new Intl.NumberFormat("id-ID").format(val));
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) {
            setCustomInput("");
            setAmount(0);
            return;
        }
        setCustomInput(new Intl.NumberFormat("id-ID").format(Number(val)));
        setAmount(Number(val));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount < 10000) return;
        const success = await onTopUp(amount);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal show={show} handleClose={onClose} size="sm" title="Top Up Digital Wallet">
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                {/* Preset Amount Chips */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Choose Amount (IDR)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESET_AMOUNTS.map((val) => {
                            const isSelected = amount === val;
                            return (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSelectPreset(val)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                        isSelected
                                            ? "bg-amber-600 text-white shadow-md shadow-amber-500/20 scale-105"
                                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-500/40"
                                    }`}
                                >
                                    {formatCurrency(val)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Custom Amount Input */}
                <div>
                    <Input
                        label="Or Enter Custom Amount"
                        type="text"
                        inputMode="numeric"
                        placeholder="Minimum Rp 10.000"
                        value={customInput}
                        onChange={handleCustomChange}
                        helperText="Minimum top up amount is Rp 10.000"
                        required
                    />
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-300">
                    <HiOutlineCreditCard className="text-xl shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                        Instant payment via Midtrans Snap (GoPay, QRIS, BCA/Mandiri Virtual Account, Credit Card).
                    </span>
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
                        disabled={amount < 10000}
                        className="flex-1"
                    >
                        Pay {formatCurrency(amount)}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TopUpModal;
