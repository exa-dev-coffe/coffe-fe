import React from "react";
import { FaApple } from "react-icons/fa";

export interface AppleSignInButtonProps {
    onClick: () => void;
    loading?: boolean;
    label?: string;
}

export const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
    onClick,
    loading = false,
    label = "Continue with Apple",
}) => {
    return (
        <button
            type="button"
            disabled={loading}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-900 dark:border-slate-700 bg-black dark:bg-slate-900 text-white hover:bg-slate-900 dark:hover:bg-slate-800 font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
            <FaApple className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};

export default AppleSignInButton;
