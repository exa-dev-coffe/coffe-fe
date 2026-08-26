import React from "react";

export interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({size = "md", className = ""}) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
        xl: "w-16 h-16 border-4",
    }[size];

    return (
        <div
            className={`inline-block animate-spin rounded-full border-solid border-amber-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses} ${className}`}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
