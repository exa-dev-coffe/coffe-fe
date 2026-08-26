import React from "react";
import {HiChevronLeft, HiChevronRight} from "react-icons/hi";

export interface PaginationProps {
    currentPage: number;
    totalData: number;
    pageSize?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPageChange: (page: number, query?: any, endpoint?: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any;
    endpoint?: string;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalData,
    pageSize = 10,
    onPageChange,
    query = {},
    endpoint,
    className = "",
}) => {
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));

    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1, query, endpoint);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1, query, endpoint);
        }
    };

    return (
        <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
            <span className="text-xs text-slate-500 dark:text-slate-400">
                Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalData} items)
            </span>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Previous page"
                >
                    <HiChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {currentPage}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Next page"
                >
                    <HiChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
