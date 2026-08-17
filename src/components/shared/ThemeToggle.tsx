import React from "react";
import {HiMoon, HiSun} from "react-icons/hi";
import {useThemeContext} from "@/app/providers/ThemeContext.ts";

export interface ThemeToggleProps {
    className?: string;
    variant?: "icon" | "full";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
    className = "",
    variant = "icon",
}) => {
    const {theme, toggleTheme} = useThemeContext();
    const isDark = theme === "dark";

    if (variant === "full") {
        return (
            <button
                onClick={toggleTheme}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
            >
                <div className="flex items-center gap-3">
                    <div className="text-amber-500 text-lg">
                        {isDark ? <HiSun /> : <HiMoon />}
                    </div>
                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                </div>
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/40 transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 ${className}`}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <HiSun className="w-5 h-5 text-amber-400 animate-fade-in" />
            ) : (
                <HiMoon className="w-5 h-5 text-slate-700 animate-fade-in" />
            )}
        </button>
    );
};

export default ThemeToggle;
