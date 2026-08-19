import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useOrderSummaryQuery } from "@/features/orders/hooks/useOrder.ts";
import usePagination from "@/core/hooks/usePagination.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import KpiStatsGrid from "@/features/dashboard/components/KpiStatsGrid.tsx";
import RevenueApexChart from "@/features/dashboard/components/RevenueApexChart.tsx";
import OrderStatusBreakdownChart from "@/features/dashboard/components/OrderStatusBreakdownChart.tsx";
import PeakHoursChart from "@/features/dashboard/components/PeakHoursChart.tsx";
import TopSellingMenus from "@/features/dashboard/components/TopSellingMenus.tsx";
import Table from "@/components/ui/Table.tsx";
import OrderStatusBadge from "@/features/orders/components/OrderStatusBadge.tsx";
import Card from "@/components/ui/Card.tsx";
import {
  formatCurrency,
  formatDateTime,
  formatDateFromDatePicker,
} from "@/core/utils/formatters.ts";
import ENDPOINTS from "@/core/api/endpoints.ts";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  DailyOrderSummary,
  OrderItem,
} from "@/features/orders/types/order.types.ts";
import { HiOutlineCalendar } from "react-icons/hi";

export const DashboardMenuPage: React.FC = () => {
  // 7-day default range
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(() => new Date());

  const startStr = startDate ? formatDateFromDatePicker(startDate) : "";
  const endStr = endDate ? formatDateFromDatePicker(endDate) : "";

  const { data: summary } = useOrderSummaryQuery(startStr, endStr);

  // TanStack Table with usePagination for recent transactions
  const {
    data: transactions,
    info,
    loading: tableLoading,
    pagination,
    sorting,
    handlePageChange,
    handleSortingChange,
    handleGlobalFilterChange,
  } = usePagination<OrderItem>({
    url: ENDPOINTS.TRANSACTIONS,
    filterColumn: ["orderFor"],
    pageSize: 10,
  });

  const columns: ColumnDef<OrderItem>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-slate-100">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "orderFor",
        header: "Customer",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.original.orderFor || "Customer"}
          </span>
        ),
      },
      {
        accessorKey: "tableName",
        header: "Table",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
            Table #{row.original.tableName || row.original.tableId || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Bill",
        cell: ({ row }) => (
          <span className="font-extrabold text-amber-600 dark:text-amber-400">
            {formatCurrency(row.original.totalPrice)}
          </span>
        ),
      },
      {
        accessorKey: "orderStatus",
        header: "Status",
        cell: ({ row }) => (
          <OrderStatusBadge status={row.original.orderStatus} size="sm" />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date & Time",
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const chartCategories =
    summary?.dailyData?.map((d: DailyOrderSummary) => d.date) || [];
  const chartRevenue =
    summary?.dailyData?.map((d: DailyOrderSummary) => d.revenue) || [];
  const chartOrders =
    summary?.dailyData?.map((d: DailyOrderSummary) => d.orders) || [];

  const statusBreakdown = summary?.statusBreakdown || [];
  const peakHours = summary?.peakHours || [];
  const topMenus = summary?.topMenus || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Business Analytics & Live Feed"
        subtitle="High-level store performance indicators, sales trend timeline, and live orders."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Analytics" },
        ]}
        action={
          /* Date Range Filter Bar */
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm">
            <HiOutlineCalendar className="text-amber-500 ml-2 text-lg shrink-0" />
            <div className="flex items-center gap-1.5 text-xs">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="w-24 bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              />
              <span className="text-slate-400 font-bold">—</span>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                dateFormat="dd/MM/yyyy"
                className="w-24 bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <KpiStatsGrid
        totalRevenue={summary?.totalRevenue || 0}
        totalOrders={summary?.totalOrders || 0}
        aov={summary?.averageOrderValue || 0}
      />

      {/* ApexCharts Revenue Trend */}
      <RevenueApexChart
        categories={chartCategories}
        revenueSeries={chartRevenue}
        orderSeries={chartOrders}
      />

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderStatusBreakdownChart data={statusBreakdown} />
        <PeakHoursChart data={peakHours} />
        <TopSellingMenus data={topMenus} />
      </div>

      {/* Recent Orders Live Table */}
      <Card variant="dashboard" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Store Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live customer orders feed with status and billing details.
            </p>
          </div>
        </div>

        <Table
          columns={columns}
          data={transactions}
          totalData={info.count}
          loading={tableLoading}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          sorting={sorting}
          onPageChange={handlePageChange}
          onSortingChange={handleSortingChange}
          onGlobalFiltering={handleGlobalFilterChange}
          searchPlaceholder="Search by customer name..."
        />
      </Card>
    </div>
  );
};

export default DashboardMenuPage;
