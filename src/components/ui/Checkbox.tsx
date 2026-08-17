import React from "react";
import {HiCheck} from "react-icons/hi";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
    label?: React.ReactNode;
    value?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    label,
    value,
    checked,
    onChange,
    disabled = false,
    className = "",
    name,
    id,
    ...props
}) => {
    const isChecked = checked !== undefined ? checked : !!value;
    const checkboxId = id || name || Math.random().toString(36).substring(7);

    return (
        <label
            htmlFor={checkboxId}
            className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            } ${className}`}
        >
            <div className="relative flex items-center justify-center">
                <input
                    id={checkboxId}
                    type="checkbox"
                    name={name}
                    checked={isChecked}
                    disabled={disabled}
                    onChange={onChange}
                    className="sr-only"
                    {...props}
                />
                <div
                    className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                        isChecked
                            ? "bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-600/30"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-amber-500"
                    }`}
                >
                    {isChecked && <HiCheck className="w-3.5 h-3.5 stroke-[1.5]" />}
                </div>
            </div>
            {label && (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </span>
            )}
        </label>
    );
};

export default Checkbox;
