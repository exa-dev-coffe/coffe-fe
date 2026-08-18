import React from "react";
import {Link} from "react-router";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import IconLogo from "@/assets/images/icon.png";
import {HiPlus, HiOutlineCreditCard} from "react-icons/hi";

export interface WalletCardProps {
    isActive: boolean;
    balance: number;
    userName?: string;
    onTopUpClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
    isActive,
    balance,
    userName = "Member",
    onTopUpClick,
}) => {
    return (
        <Card
            variant="glass"
            className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 shadow-2xl shadow-amber-900/30 border border-amber-500/30"
        >
            {/* Background Decorative Circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col justify-between min-h-[220px] space-y-6">
                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-200/50 dark:bg-white/15 backdrop-blur-md p-1.5 flex items-center justify-center border border-slate-300/50 dark:border-white/20">
                            <img src={IconLogo} alt="Diskusi Coffee" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block">
                                DISKUSI DIGITAL WALLET
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-200 block">
                                Coffee Club Member Card
                            </span>
                        </div>
                    </div>

                    <Badge
                        variant={isActive ? "success" : "warning"}
                        size="sm"
                        dot={isActive}
                        className="bg-slate-200/50 dark:bg-black/30 backdrop-blur-md text-slate-900 dark:text-white border-slate-300/50 dark:border-white/20"
                    >
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                </div>

                {/* Balance Center */}
                <div className="space-y-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-amber-200/80">
                        Available Balance
                    </span>
                    <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {isActive ? formatCurrency(balance) : "Rp 0"}
                    </p>
                </div>

                {/* Card Bottom Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/15">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-white/90">
                        <HiOutlineCreditCard className="text-amber-600 dark:text-amber-300 text-base shrink-0" />
                        <span className="truncate">{userName}</span>
                    </div>

                    {isActive ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onTopUpClick}
                            leftIcon={<HiPlus />}
                            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-amber-100 shadow-md font-bold px-4 self-start sm:self-auto"
                        >
                            Top Up Balance
                        </Button>
                    ) : (
                        <Link to="/my-wallet/activate" className="self-start sm:self-auto">
                            <Button
                                variant="primary"
                                size="sm"
                                className="bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950 hover:bg-amber-600 dark:hover:bg-amber-300 font-bold px-4"
                            >
                                Activate Wallet
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default WalletCard;
