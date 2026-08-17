import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "glass" | "dashboard" | "auth" | "interactive";
    padding?: "none" | "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    variant = "default",
    padding = "md",
    children,
    className = "",
    ...props
}) => {
    const paddingClasses = {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8 sm:p-10",
    }[padding];

    const variantClasses = {
        default:
            "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm",
        elevated:
            "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-lg shadow-slate-900/5 dark:shadow-black/20",
        glass:
            "glass-panel rounded-3xl shadow-md",
        dashboard:
            "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm p-6 sm:p-8",
        auth:
            "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-12 w-full max-w-xl",
        interactive:
            "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl hover:border-amber-500/40 dark:hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer",
    }[variant];

    return (
        <div
            className={`transition-colors duration-200 ${variantClasses} ${
                variant !== "dashboard" && variant !== "auth" ? paddingClasses : ""
            } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
