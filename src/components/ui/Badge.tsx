import React from "react";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps {
    variant?: BadgeVariant;
    size?: "sm" | "md";
    dot?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = "neutral",
    size = "md",
    dot = false,
    children,
    className = "",
}) => {
    const sizeClasses = {
        sm: "px-2.5 py-0.5 text-xs",
        md: "px-3 py-1 text-xs font-semibold",
    }[size];

    const variantClasses = {
        primary:
            "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
        success:
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
        warning:
            "bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30",
        danger:
            "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20",
        info:
            "bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20",
        neutral:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700",
    }[variant];

    const dotColors = {
        primary: "bg-amber-500",
        success: "bg-emerald-500",
        warning: "bg-amber-400",
        danger: "bg-rose-500",
        info: "bg-sky-500",
        neutral: "bg-slate-400",
    }[variant];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full tracking-wide transition-colors ${sizeClasses} ${variantClasses} ${className}`}
        >
            {dot && (
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors}`}></span>
                </span>
            )}
            <span>{children}</span>
        </span>
    );
};

export default Badge;
