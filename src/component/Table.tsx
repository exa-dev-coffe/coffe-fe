import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    type PaginationState,
    type SortingState,
    type Updater,
    useReactTable
} from "@tanstack/react-table";
import {useState} from "react";
import useDebounce from "../hook/useDebounce.ts";
import Loading from "./ui/Loading.tsx";

interface TableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, any>[]; // generic, fleksibel
    loading: boolean;
    onPageChange: (updater: Updater<PaginationState>) => void;
    onGlobalFiltering: (updater: Updater<string>) => void;
    pageIndex: number;
    pageSize: number;
    onSortingChange: (updater: Updater<SortingState>) => void;
    totalData: number;
    sorting: SortingState;
}

const Table = <TData, >({
                            columns,
                            sorting,
                            pageIndex,
                            pageSize,
                            onSortingChange,
                            onPageChange,
                            onGlobalFiltering,
                            loading,
                            data,
                            totalData
                        }: TableProps<TData>) => {

    const [search, setSearch] = useState("");
    const debounceSearch = useDebounce(onGlobalFiltering, 500);
    const table = useReactTable({
        data: data,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        enableSorting: true,
        enableGlobalFilter: true,
        onPaginationChange: onPageChange,
        onGlobalFilterChange: (updater: Updater<string>) => {
            // Debounce global filter change
            setSearch(updater);
            debounceSearch(updater);
        },
        pageCount: Math.ceil(totalData / pageSize),
        onSortingChange: onSortingChange,
        state: {
            pagination: {
                pageSize,
                pageIndex,
            },
            sorting: sorting,
            globalFilter: search,
        },
    })

    return (
        <>
            <div
                className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                {/* Top controls: Page size & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div>
                        <select
                            className="border rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            value={table.getState().pagination.pageSize}
                        >
                            <option value={10}>Show 10 entries</option>
                            <option value={25}>Show 25 entries</option>
                            <option value={50}>Show 50 entries</option>
                            <option value={100}>Show 100 entries</option>
                        </select>
                    </div>

                    <div className="w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="border rounded px-3 py-1 text-sm w-full sm:w-64 bg-white dark:bg-gray-700 text-slate-700 dark:text-slate-100 border-slate-200 dark:border-slate-600"
                            onChange={(e) => table.setGlobalFilter(e.target.value)}
                            value={table.getState().globalFilter ?? ""}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm border-collapse">
                        {/* Header */}
                        <thead
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-100 uppercase text-xs">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={`py-3 px-4 select-none ${header.column.getCanSort() ? 'cursor-pointer' : ''} border-b border-gray-200 dark:border-slate-700`}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div className="flex items-center gap-1">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: "↑",
                                                    desc: "↓",
                                                }[header.column.getIsSorted() as string] ?? ""}
                                            </div>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>

                        {/* Body */}
                        <tbody className={"overflow-auto"}>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length}
                                    className="text-center py-10 text-gray-500 dark:text-gray-300">
                                    <Loading/>
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length}
                                    className="text-center py-10 text-gray-500 dark:text-gray-300">
                                    No Data Available
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id}
                                            className="py-3 px-4 border-b border-gray-100 dark:border-slate-700 text-slate-800 dark:text-slate-100">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>

                        {/* Footer */}
                        {table.getFooterGroups().length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs">
                            {table.getFooterGroups().map((footerGroup) => (
                                <tr key={footerGroup.id}>
                                    {footerGroup.headers.map((header) => (
                                        <th key={header.id} className="py-2 px-4">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.footer, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        Showing {table.getRowModel().rows.length} of {totalData} entries
      </span>
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-slate-700"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || loading}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-slate-800 dark:text-slate-100">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
                        <button
                            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-slate-700"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || loading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Table;