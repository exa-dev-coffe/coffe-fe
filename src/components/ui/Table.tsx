import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
    type Updater,
    useReactTable,
} from "@tanstack/react-table";
import {useState} from "react";
import useDebounce from "@/core/hooks/useDebounce.ts";
import Spinner from "@/components/ui/Spinner.tsx";
import {HiChevronDown, HiChevronUp, HiSearch, HiChevronLeft, HiChevronRight} from "react-icons/hi";

interface TableProps<TData> {
    data: TData[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    columns: ColumnDef<TData, any>[];
    loading: boolean;
    onPageChange: (updater: Updater<PaginationState>) => void;
    onGlobalFiltering?: (updater: Updater<string>) => void;
    pageIndex: number;
    pageSize: number;
    onSortingChange: (updater: Updater<SortingState>) => void;
    totalData: number;
    sorting: SortingState;
    searchPlaceholder?: string;
    showSearch?: boolean;
    showPageSize?: boolean;
}

export const Table = <TData,>({
    columns,
    sorting,
    pageIndex,
    pageSize,
    onSortingChange,
    onPageChange,
    onGlobalFiltering,
    loading,
    data,
    totalData,
    searchPlaceholder = "Search records...",
    showSearch = true,
    showPageSize = true,
}: TableProps<TData>) => {
    const [search, setSearch] = useState("");
    const debounceSearch = useDebounce((val: string) => {
        if (onGlobalFiltering) onGlobalFiltering(val);
    }, 400);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        enableSorting: true,
        enableGlobalFilter: true,
        onPaginationChange: onPageChange,
        onGlobalFilterChange: (updater: Updater<string>) => {
            const nextVal = typeof updater === "function" ? updater(search) : updater;
            setSearch(nextVal);
            debounceSearch(nextVal);
        },
        pageCount: Math.max(1, Math.ceil(totalData / pageSize)),
        onSortingChange,
        state: {
            pagination: {pageSize, pageIndex},
            sorting,
            globalFilter: search,
        },
    });

    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            {(showSearch || showPageSize) && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {showPageSize && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Show</span>
                            <select
                                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus-ring cursor-pointer"
                                value={pageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10 rows</option>
                                <option value={25}>25 rows</option>
                                <option value={50}>50 rows</option>
                                <option value={100}>100 rows</option>
                            </select>
                        </div>
                    )}

                    {showSearch && onGlobalFiltering && (
                        <div className="relative w-full sm:w-72">
                            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    debounceSearch(e.target.value);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Table Container */}
            <div className="overflow-hidden border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr
                                    key={headerGroup.id}
                                    className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`py-3.5 px-4 select-none ${
                                                header.column.getCanSort() ? "cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" : ""
                                            }`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === "asc" ? (
                                                    <HiChevronUp className="text-amber-500 text-base" />
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <HiChevronDown className="text-amber-500 text-base" />
                                                ) : null}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Spinner size="md" />
                                            <p className="text-xs text-slate-400">Loading data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center py-16 text-slate-500 dark:text-slate-400 text-sm">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="py-3.5 px-4 text-slate-700 dark:text-slate-200">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{data.length}</span> of{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalData}</span> entries
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || loading}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                        >
                            <HiChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2">
                            Page {pageIndex + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || loading}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                        >
                            <HiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;
