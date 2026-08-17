import React from "react";
import GoogleIcon from "@/assets/images/google-logo.svg";

export interface GoogleSignInButtonProps {
    onClick: () => void;
    loading?: boolean;
    label?: string;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
    onClick,
    loading = false,
    label = "Continue with Google",
}) => {
    return (
        <button
            type="button"
            disabled={loading}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
            <img src={GoogleIcon} alt="Google" className="w-5 h-5 object-contain" />
            <span>{label}</span>
        </button>
    );
};

export default GoogleSignInButton;
