import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/app/providers/AuthContext.ts";
import UserAvatar from "@/components/shared/UserAvatar.tsx";
import {
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineRefresh,
  HiOutlineClipboardList,
} from "react-icons/hi";

interface PosHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartItemCount: number;
  onClearCart: () => void;
  onRefreshMenus: () => void;
  isRefreshing?: boolean;
  onOpenHistory?: () => void;
  pendingCount?: number;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartItemCount,
  onClearCart,
  onRefreshMenus,
  isRefreshing,
  onOpenHistory,
  pendingCount = 0,
}) => {
  const { auth } = useAuthContext();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Cashier Status */}
      <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
            <HiOutlineCash />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                Cashier Point of Sale
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Terminal Operator:</span>
              <strong className="text-slate-800 dark:text-slate-200 capitalize">
                {auth.name || "Cashier"}
              </strong>
            </p>
          </div>
        </div>

        {/* Live Clock on Mobile */}
        <div className="flex md:hidden items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl">
          <HiOutlineClock />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex-1 max-w-md w-full relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        <input
          type="text"
          placeholder="Search products by name or code... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls: Clock & Order History & Refresh & Clear */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
          <HiOutlineClock className="text-amber-500 text-sm" />
          <span>{currentTime}</span>
        </div>

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 hover:bg-amber-500/20 text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            <HiOutlineClipboardList className="text-base text-amber-600 dark:text-amber-400" />
            <span>Order History</span>
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-mono animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onRefreshMenus}
          disabled={isRefreshing}
          title="Refresh Catalog"
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
        >
          <HiOutlineRefresh className={`text-base ${isRefreshing ? "animate-spin" : ""}`} />
        </button>

        {cartItemCount > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <HiOutlineTrash className="text-sm" />
            <span>Reset Ticket</span>
          </button>
        )}

        <div className="hidden sm:flex items-center pl-2 border-l border-slate-200 dark:border-slate-700">
          <UserAvatar src={auth.photo} name={auth.name} size="sm" />
        </div>
      </div>
    </div>
  );
};

export default PosHeader;
