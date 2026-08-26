import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost" | "amber";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}) => {
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
        md: "px-4 py-2 text-sm rounded-xl gap-2",
        lg: "px-6 py-3 text-base rounded-2xl gap-2.5 font-medium",
    }[size];

    const variantClasses = {
        primary:
            "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98]",
        secondary:
            "bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 active:scale-[0.98]",
        outline:
            "border border-amber-600/40 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10 active:scale-[0.98]",
        danger:
            "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white shadow-md shadow-rose-500/20 active:scale-[0.98]",
        ghost:
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
        amber:
            "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-900/60",
    }[variant];

    const isDisabled = disabled || loading;

    return (
        <button
            disabled={isDisabled}
            className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus-ring ${
                fullWidth ? "w-full" : ""
            } ${sizeClasses} ${variantClasses} ${
                isDisabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
            } ${className}`}
            {...props}
        >
            {loading ? (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
            ) : leftIcon ? (
                <span className="shrink-0">{leftIcon}</span>
            ) : null}
            <span>{children}</span>
            {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </button>
    );
};

export default Button;
