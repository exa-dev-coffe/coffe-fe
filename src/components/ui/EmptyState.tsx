import React from "react";
import {Button} from "@/components/ui/Button.tsx";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className = "",
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 ${className}`}
        >
            {icon && (
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button variant="primary" size="md" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
