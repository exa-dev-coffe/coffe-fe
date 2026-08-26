import React, {useState} from "react";
import {useNavigate} from "react-router";
import {ZodError} from "zod";
import { useActivateWalletMutation, useWalletBalanceQuery } from "@/features/wallet/hooks/useWallet.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import {formatErrorZod, validate} from "@/core/utils/validation.ts";
import {
    ActivatePinSchema,
    type ActivatePinFormData,
} from "@/features/wallet/types/wallet.types.ts";
import {HiOutlineShieldCheck, HiOutlineBan} from "react-icons/hi";

export const ActivateWalletPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: balanceData } = useWalletBalanceQuery();
    const { mutateAsync: activateBalance, isPending: loading } = useActivateWalletMutation();
    const [formData, setFormData] = useState({
        pin: "",
        confirmPin: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isSuspended = Boolean(balanceData && !balanceData.isActive && balanceData.walletNumber);

    const handlePinChange = (field: "pin" | "confirmPin", val: string) => {
        const numeric = val.replace(/\D/g, "").slice(0, 6);
        setFormData((prev) => ({...prev, [field]: numeric}));
        if (errors[field]) {
            setErrors((prev) => ({...prev, [field]: ""}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        try {
            validate(formData, ActivatePinSchema);
            const success = await activateBalance(formData.pin);
            if (success) {
                navigate("/my-wallet");
            }
        } catch (err) {
            if (err instanceof ZodError) {
                setErrors(formatErrorZod<ActivatePinFormData>(err));
            }
        }
    };

    if (isSuspended) {
        return (
            <div className="py-10">
                <div className="container mx-auto px-4 sm:px-6 max-w-xl space-y-8">
                    <PageHeader
                        title="Wallet Suspended"
                        subtitle="Your member wallet has been suspended by an administrator."
                        breadcrumb={[
                            {label: "Home", to: "/"},
                            {label: "Wallet", to: "/my-wallet"},
                            {label: "Suspended"},
                        ]}
                    />

                    <Card variant="dashboard" className="p-8 sm:p-10 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-3xl">
                            <HiOutlineBan />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Wallet Suspended by Administrator
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                                Your digital wallet is currently suspended. You cannot activate or set a PIN yourself. Please contact Diskusi Coffee customer support or an administrator to request wallet re-activation.
                            </p>
                        </div>
                        <Button variant="secondary" onClick={() => navigate("/my-wallet")}>
                            Back to My Wallet
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="py-10">
            <div className="container mx-auto px-4 sm:px-6 max-w-xl space-y-8">
                <PageHeader
                    title="Activate Digital Wallet"
                    subtitle="Create a secure 6-digit transaction PIN to protect your member balance."
                    breadcrumb={[
                        {label: "Home", to: "/"},
                        {label: "Wallet", to: "/my-wallet"},
                        {label: "Activate"},
                    ]}
                />

                <Card variant="dashboard" className="p-8 sm:p-10 space-y-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center text-3xl">
                            <HiOutlineShieldCheck />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Security PIN Setup
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            This 6-digit PIN will be required whenever you make payments at checkout.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center">
                                Set 6-Digit PIN
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="••••••"
                                value={formData.pin}
                                onChange={(e) => handlePinChange("pin", e.target.value)}
                                className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-slate-100"
                                required
                            />
                            {errors.pin && (
                                <p className="text-xs text-rose-500 text-center font-medium">{errors.pin}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-center">
                                Confirm 6-Digit PIN
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="••••••"
                                value={formData.confirmPin}
                                onChange={(e) => handlePinChange("confirmPin", e.target.value)}
                                className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus-ring text-slate-900 dark:text-slate-100"
                                required
                            />
                            {errors.confirmPin && (
                                <p className="text-xs text-rose-500 text-center font-medium">{errors.confirmPin}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            disabled={formData.pin.length !== 6 || formData.confirmPin.length !== 6}
                        >
                            Activate Wallet PIN
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ActivateWalletPage;
