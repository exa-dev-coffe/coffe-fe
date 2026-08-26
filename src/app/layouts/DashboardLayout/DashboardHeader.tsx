import React from "react";
import ThemeToggle from "@/components/shared/ThemeToggle.tsx";
import { HiMenuAlt2 } from "react-icons/hi";

export interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 h-20 glass-nav transition-colors">
      <div className="h-full px-4 sm:px-8 flex items-center justify-between">
        {/* Left Toggle & Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
            aria-label="Toggle navigation drawer"
          >
            <HiMenuAlt2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Live Station Connected
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
