import {useEffect, useMemo, useState} from "react";
import {createColumnHelper} from "@tanstack/react-table";
import Chart from "react-apexcharts";
import type {ApexOptions} from "apexcharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import usePagination from "../hook/usePagination.ts";
import Table from "../component/Table.tsx";
import type {Order, SummaryReport} from "../model/order.ts";
import {formatDateFromDatePicker, formatDateTime} from "../utils";
import useOrder from "../hook/useOrder.ts";
import useThemeContext from "../hook/useThemeContext.ts";

// =============================================
// FIX: STATIC OPTIONS (tidak ikut berubah)
// =============================================
const baseOptions: ApexOptions = {
    chart: {
        id: "revenue-chart",
        toolbar: {show: false},
    },
    dataLabels: {enabled: false},
    stroke: {curve: "smooth"},
    yaxis: [
        {
            title: {text: "Revenue",},
            labels: {
                formatter: (val: number) => "Rp " + val.toLocaleString(),
            },
        },
        {
            opposite: true,
            title: {text: "Total Orders"},
            labels: {
                formatter: (val: number) => val.toLocaleString(),
            },
        },
    ],
};

const statusClass = [
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
];

const statusLabel = [
    'Order Confirmed',
    'Delivering Order',
    'Order Completed'
];
const columnHelper = createColumnHelper<Order>();

const DashboardMenuPage = () => {

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const {theme} = useThemeContext()
    const [advancedFilter, setAdvancedFilter] = useState<Record<string, string | number>>({
        startDate: formatDateFromDatePicker(new Date()),
        endDate: formatDateFromDatePicker(new Date()),
    });
    const [summaryOrder, setSummaryOrder] = useState<SummaryReport[]>([]);
    const {getSummaryOrder} = useOrder()

    const {
        data,
        sorting,
        pagination,
        handleSortingChange,
        handlePageChange,
        handleGlobalFilterChange,
        info,
        loading
    } = usePagination<Order>({url: "/api/1.0/transactions", filterColumn: ['orderFor'], advancedFilter});


    // ======================================================
    // TABLE COLUMNS
    // ======================================================
    const columns = useMemo(() => [
        columnHelper.accessor("id", {
            header: "Order",
            enableSorting: true,
            cell: (info) => (
                <div>
                    <div className="text-sm font-medium dark:text-slate-100">{info.getValue()}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDateTime(info.row.original.createdAt)}
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor((row) => row.orderBy, {
            id: "orderFor",
            header: "Customer",
            enableSorting: false,
            cell: (info) => (
                <span className="dark:text-slate-200">{info.getValue()}</span>
            )
        }),
        columnHelper.accessor((row) => row.totalPrice, {
            header: "Total",
            id: "total_price",
            cell: (info) => (
                <span className="dark:text-slate-200">Rp {info.getValue().toLocaleString()}</span>
            ),
        }),
        columnHelper.accessor((row) => row.orderStatus, {
            header: "Order Status",
            cell: (info) => (
                <span className={`px-2 py-1 rounded-full text-xs ${statusClass[info.getValue()]}`}>
                {statusLabel[info.getValue()]}
              </span>
            ),
        }),
    ], []);


    // ======================================================
    // CHART DATA
    // ======================================================
    const chartData = useMemo(() => {
        if (!startDate || !endDate) return {categories: [], revenue: [], totalOrder: []};
        const dayMs = 1000 * 60 * 60 * 24;
        const days: string[] = [];
        const revenue: number[] = [];
        const totalOrder: number[] = [];
        const start = startDate.getTime();
        const end = endDate.getTime();

        for (let t = start; t <= end; t += dayMs) {
            const date = new Date(t);
            const dateStr = date.toLocaleDateString(undefined, {month: "short", day: "numeric"});
            days.push(dateStr);

            const dayData = summaryOrder.find((o) => new Date(o.createdAt).toDateString() === date.toDateString());
            if (dayData) {
                revenue.push(dayData.total);
                totalOrder.push(dayData.totalOrder);
            } else {
                revenue.push(0);
                totalOrder.push(0);
            }
        }
        return {categories: days, revenue, totalOrder};
    }, [summaryOrder, startDate, endDate]);


    // ======================================================
    // APEX CHART OPTIONS (LIGHT + DARK MODE)
    // ======================================================

    const normalizeYAxis = (y: ApexOptions["yaxis"]): ApexYAxis[] => {
        if (!y) return [];
        return Array.isArray(y) ? y : [y]; // jadikan array
    };

    const chartOptions = useMemo<ApexOptions>(() => {
        const textColor = theme === "dark" ? "#94a3b8" : "#64748b";


        return {
            ...baseOptions,
            theme: {mode: theme},
            chart: {
                ...baseOptions.chart,
                foreColor: textColor,
            },
            xaxis: {
                categories: chartData.categories,
                labels: {style: {colors: textColor}},
            },
            yaxis: normalizeYAxis(baseOptions.yaxis).map((y) => ({
                ...y,
                title: {
                    ...y.title,
                    style: {color: textColor}, // TRUE
                },
                labels: {
                    ...y.labels,
                    style: {colors: textColor}, // FIXED
                },
            })),
            tooltip: {
                theme: theme,
            },
        };
    }, [theme, chartData.categories]);


    const chartSeries = useMemo(() => [
        {name: "Revenue", data: chartData.revenue},
        {name: "Total Orders", data: chartData.totalOrder},
    ], [chartData.revenue, chartData.totalOrder]);


    // ======================================================
    // FETCH DATA
    // ======================================================
    useEffect(() => {
        setAdvancedFilter({
            startDate: formatDateFromDatePicker(startDate),
            endDate: formatDateFromDatePicker(endDate),
        });

        const fetchSummary = async () => {
            const response = await getSummaryOrder(
                formatDateFromDatePicker(startDate),
                formatDateFromDatePicker(endDate),
            );
            if (response) {
                setSummaryOrder(response);
            }
        };
        fetchSummary();
    }, [startDate, endDate]);

    // ======================================================
    // RENDER UI
    // ======================================================
    return (
        <section className="container mx-auto px-4 w-full space-y-3
            transition-colors ">

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    {
                        label: `Revenue (${chartData.categories.length}d)`,
                        value: `Rp ${summaryOrder.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`,
                        icon: "💰",
                        // gradient hanya berlaku di light, dark memakai background solid
                        accentLight: "from-emerald-50 to-emerald-100 text-emerald-700",
                        accentDark: "bg-slate-800 text-slate-100 border-slate-700",
                    },
                    {
                        label: `Orders (${chartData.categories.length}d)`,
                        value: data.length.toString(),
                        icon: "📦",
                        accentLight: "from-sky-50 to-sky-100 text-sky-700",
                        accentDark: "bg-slate-800 text-slate-100 border-slate-700",
                    },
                    {
                        label: "Average Order Value (AOV)",
                        value: `Rp ${
                            data.length
                                ? Math.round(summaryOrder.reduce((sum, o) => sum + o.total, 0) / data.length).toLocaleString()
                                : 0
                        }`,
                        icon: "📈",
                        accentLight: "from-amber-50 to-amber-100 text-amber-700",
                        accentDark: "bg-slate-800 text-slate-100 border-slate-700",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`
                relative rounded-xl p-5 shadow-sm border border-slate-100
                hover:shadow-md transition-all duration-200
                
                /* Light Mode */
                bg-gradient-to-br ${item.accentLight}

                /* Dark Mode */
                dark:bg-none 
                dark:${item.accentDark}
                dark:border-slate-700
            `}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">{item.icon}</div>

                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {item.label}
                            </div>
                        </div>

                        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* DATE FILTER */}
            <div className="bg-white dark:bg-slate-800 dark:border-slate-700
                p-5 rounded-xl shadow-sm border border-slate-100 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        📅 Filter by Date
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700
                            px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => date && setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate}
                                dateFormat="yyyy-MM-dd"
                                className="bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm w-28"
                            />
                            <span className="text-slate-400 dark:text-slate-300 text-sm">→</span>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => date && setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="yyyy-MM-dd"
                                className="bg-transparent outline-none text-slate-700 dark:text-slate-200 text-sm w-28"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setStartDate(new Date());
                                setEndDate(new Date());
                            }}
                            className="text-xs bg-slate-100 dark:bg-slate-700 dark:text-slate-200
                                hover:bg-slate-200 dark:hover:bg-slate-600
                                px-3 py-2 rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* CHART */}
            <div className="bg-white dark:bg-slate-800 dark:border-slate-700 p-5
                rounded-xl shadow-sm border border-slate-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        💹 Revenue Overview
                    </h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDateFromDatePicker(startDate)} – {formatDateFromDatePicker(endDate)}
                    </span>
                </div>
                <Chart options={chartOptions} series={chartSeries} type="line" height={350}/>
            </div>

            {/* TABLE */}
            <div
                className="bg-white dark:bg-slate-800 dark:border-slate-700
                    p-5 rounded-xl shadow-sm border border-slate-100
                    overflow-auto scrollbar-thin transition-colors">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        📦 Recent Orders
                    </h3>
                </div>
                <Table<Order>
                    data={data}
                    columns={columns}
                    loading={loading}
                    onPageChange={handlePageChange}
                    onGlobalFiltering={handleGlobalFilterChange}
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    onSortingChange={handleSortingChange}
                    totalData={info.count}
                    sorting={sorting}
                />
            </div>
        </section>
    );
};

export default DashboardMenuPage;
