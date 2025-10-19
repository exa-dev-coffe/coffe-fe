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

const statusClass = [
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-sky-100 text-sky-700",
    "bg-red-100 text-red-700"
]


const statusLabel = [
    'Order Confirmed',
    'Delivering Order',
    'Order Completed'
]

const DashboardMenuPage = () => {

    const [startDate, setStartDate] = useState<Date>(new Date());
    const [advancedFilter, setAdvancedFilter] = useState<Record<string, string | number>>({
        startDate: formatDateFromDatePicker(new Date()),
        endDate: formatDateFromDatePicker(new Date()),
    });
    const [summaryOrder, setSummaryOrder] = useState<SummaryReport[]>([]);
    const {getSummaryOrder} = useOrder()
    const [endDate, setEndDate] = useState<Date>(new Date());
    const {
        data,
        sorting,
        pagination,
        handleSortingChange,
        handlePageChange,
        handleGlobalFilterChange,
        info,
        loading
    } = usePagination<Order>({url: "/api/1.0/transactions", filterColumn: ['orderBy'], advancedFilter});


    const columnHelper = createColumnHelper<Order>();
    const columns = useMemo(() => [
        columnHelper.accessor("id", {
            header: "Order",
            enableSorting: true,
            cell: (info) => (
                <div>
                    <div className="text-sm font-medium">{info.getValue()}</div>
                    <div className="text-xs text-slate-400">{formatDateTime(info.row.original.createdAt)}</div>
                </div>
            ),
        }),
        columnHelper.accessor((row) => row.orderBy, {
            id: "orderFor",
            header: "Customer",
            enableSorting: false,
        }),
        columnHelper.accessor((row) => row.totalPrice, {
            header: "Total",
            id: "total_price",
            cell: (info) => <>Rp {info.getValue().toLocaleString()}</>,
        }),
        // columnHelper.accessor("items", {header: "Items"}),
        columnHelper.accessor((row) => row.orderStatus, {
            header: "Order Status",
            cell: (info) => (
                <span className={`px-2 py-1 rounded-full text-xs ${statusClass[info.getValue()]}`}>
            {statusLabel[info.getValue()]}
          </span>
            ),
        }),
    ], [])

    // --- Chart setup ---
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

    const chartOptions: ApexOptions = {
        chart: {id: "revenue-chart", toolbar: {show: false}},
        xaxis: {categories: chartData.categories},
        yaxis: [
            {
                title: {text: "Revenue"},
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
        dataLabels: {enabled: false},
        stroke: {curve: "smooth"},
        tooltip: {
            shared: true,
            y: [
                {
                    formatter: (val: number) => "Rp " + val.toLocaleString(),
                },
                {
                    formatter: (val: number) => val.toLocaleString() + " orders",
                },
            ],
        },
    };

    const chartSeries = [
        {name: "Revenue", data: chartData.revenue},
        {name: "Total Orders", data: chartData.totalOrder},
    ];

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

    return (
        <section className="container mx-auto px-4 w-full space-y-3">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    {
                        label: `Revenue (${chartData.categories.length}d)`,
                        value: `Rp ${summaryOrder.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`,
                        icon: "💰",
                        accent: "from-emerald-50 to-emerald-100 text-emerald-700",
                    },
                    {
                        label: `Orders (${chartData.categories.length}d)`,
                        value: data.length.toString(),
                        icon: "📦",
                        accent: "from-sky-50 to-sky-100 text-sky-700",
                    },
                    {
                        label: "Average Order Value (AOV)",
                        value: `Rp ${
                            data.length
                                ? Math.round(summaryOrder.reduce((sum, o) => sum + o.total, 0) / data.length).toLocaleString()
                                : 0
                        }`,
                        icon: "📈",
                        accent: "from-amber-50 to-amber-100 text-amber-700",
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        className={`relative bg-gradient-to-br ${item.accent} rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">{item.icon}</div>
                            <div className="text-xs font-medium text-slate-500">{item.label}</div>
                        </div>
                        <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Date Picker Section */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        📅 Filter by Date
                    </h3>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => date && setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                maxDate={endDate}
                                dateFormat="yyyy-MM-dd"
                                className="bg-transparent outline-none text-slate-700 text-sm w-28"
                            />
                            <span className="text-slate-400 text-sm">→</span>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => date && setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="yyyy-MM-dd"
                                className="bg-transparent outline-none text-slate-700 text-sm w-28"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setStartDate(new Date());
                                setEndDate(new Date());
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg transition-all"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        💹 Revenue Overview
                    </h3>
                    <span className="text-xs text-slate-400">
      {formatDateFromDatePicker(startDate)} – {formatDateFromDatePicker(endDate)}
    </span>
                </div>
                <Chart options={chartOptions} series={chartSeries} type="line" height={350}/>
            </div>

            {/* Orders Table */}
            <div
                className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 overflow-auto scrollbar-thin h-full">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
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
