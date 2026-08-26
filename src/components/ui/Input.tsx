import React, {forwardRef} from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({label, error, helperText, className = "", id, required, disabled, ...props}, ref) => {
        const inputId = id || props.name || Math.random().toString(36).substring(7);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                        {label}
                        {required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        disabled={disabled}
                        className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800/80 border rounded-xl transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-ring ${
                            error
                                ? "border-rose-400 dark:border-rose-500/70 ring-1 ring-rose-400"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""} ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
                {!error && helperText && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
