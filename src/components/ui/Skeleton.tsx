import React from "react";

export interface SkeletonProps {
    variant?: "text" | "circular" | "rectangular" | "rounded";
    width?: string | number;
    height?: string | number;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = "rectangular",
    width,
    height,
    className = "",
}) => {
    const variantClasses = {
        text: "h-4 rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-2xl",
    }[variant];

    const style: React.CSSProperties = {
        width: width !== undefined ? width : "100%",
        height: height !== undefined ? height : variant === "text" ? "1rem" : "100%",
    };

    return (
        <div
            style={style}
            className={`shimmer ${variantClasses} ${className}`}
            aria-hidden="true"
        />
    );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({className = ""}) => (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 ${className}`}>
        <Skeleton variant="rounded" height={180} />
        <div className="space-y-2">
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
        </div>
        <div className="flex justify-between items-center pt-2">
            <Skeleton variant="text" width="30%" height={22} />
            <Skeleton variant="rounded" width={80} height={36} />
        </div>
    </div>
);

export default Skeleton;
