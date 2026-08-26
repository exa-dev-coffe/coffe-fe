import React, {forwardRef, useState} from "react";
import {HiEye, HiEyeOff} from "react-icons/hi";

export interface InputIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string;
    helperText?: string;
}

export const InputIcon = forwardRef<HTMLInputElement, InputIconProps>(
    ({label, icon, rightIcon, error, helperText, type = "text", className = "", id, required, disabled, ...props}, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const inputType = isPassword ? (showPassword ? "text" : "password") : type;
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
                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 text-lg">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        type={inputType}
                        disabled={disabled}
                        className={`w-full py-2.5 text-sm bg-white dark:bg-slate-800/80 border rounded-xl transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-ring ${
                            icon ? "pl-11" : "pl-4"
                        } ${isPassword || rightIcon ? "pr-11" : "pr-4"} ${
                            error
                                ? "border-rose-400 dark:border-rose-500/70 ring-1 ring-rose-400"
                                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900" : ""} ${className}`}
                        {...props}
                    />
                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer text-lg"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <HiEyeOff /> : <HiEye />}
                        </button>
                    ) : rightIcon ? (
                        <div className="absolute right-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            {rightIcon}
                        </div>
                    ) : null}
                </div>
                {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
                {!error && helperText && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
                )}
            </div>
        );
    }
);

InputIcon.displayName = "InputIcon";

export default InputIcon;
