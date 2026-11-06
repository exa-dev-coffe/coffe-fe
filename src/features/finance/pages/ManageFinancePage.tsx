import React from "react";
import { Link } from "react-router";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineReceiptTax,
  HiOutlineTruck,
  HiOutlineCube,
  HiOutlineArrowRight,
} from "react-icons/hi";
import {
  useExpensesSummaryQuery,
  useFinancialSummaryQuery,
  useMonthlyExpensesQuery,
  usePurchasesQuery,
  useSuppliersQuery,
} from "../hooks/useFinance.ts";
import { useOrderSummaryQuery } from "@/features/orders/hooks/useOrder.ts";

export const ManageFinancePage: React.FC = () => {
  const { data: pnlSummary, isLoading: loadingPnl } = useFinancialSummaryQuery();
  const { data: rawMonthly = [], isLoading: loadingMonthly } = useMonthlyExpensesQuery();
  const monthlyExpenses = Array.isArray(rawMonthly) ? rawMonthly : [];

  const { data: rawExpensesSummary = [], isLoading: loadingExpenseSummary } = useExpensesSummaryQuery();
  const expensesSummary = Array.isArray(rawExpensesSummary) ? rawExpensesSummary : [];

  const { data: purchases = [] } = usePurchasesQuery();
  const { data: suppliers = [] } = useSuppliersQuery();

  // Compute live revenue across the store
  const today = React.useMemo(() => new Date(), []);
  const startOfYear = React.useMemo(() => new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0], [today]);
  const endOfToday = React.useMemo(() => today.toISOString().split("T")[0], [today]);
  const { data: orderSummary } = useOrderSummaryQuery(startOfYear, endOfToday);

  const totalRevenue = Number(pnlSummary?.total_revenue || orderSummary?.totalRevenue || 0);
  const totalCogs = Number(pnlSummary?.cogs || 0);
  const totalOpex = Number(pnlSummary?.total_operational_expense || pnlSummary?.total_expenses || 0);
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalOpex;
  const profitMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Financial Overview"
        subtitle="Comprehensive store Profit & Loss (P&L), gross revenue, ingredient COGS, and operating margins"
      />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/dashboard/manage-purchases"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <HiOutlineReceiptTax className="text-xl" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Purchase Orders
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {purchases.length} Records
              </span>
            </div>
          </div>
          <HiOutlineArrowRight className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/manage-expenses"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <HiOutlineCash className="text-xl" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Store OPEX
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Operating Expenses
              </span>
            </div>
          </div>
          <HiOutlineArrowRight className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/manage-suppliers"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <HiOutlineTruck className="text-xl" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Vendors Directory
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {suppliers.length} Approved Suppliers
              </span>
            </div>
          </div>
          <HiOutlineArrowRight className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/dashboard/manage-inventory"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-sm transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <HiOutlineCube className="text-xl" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Ingredients & Stock
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Recipe Formulation
              </span>
            </div>
          </div>
          <HiOutlineArrowRight className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingPnl ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            {/* Net Profit Card */}
            <Card
              className={`p-5 ${
                netProfit >= 0
                  ? "bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20"
                  : "bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Net Store Profit
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    netProfit >= 0
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-rose-500/15 text-rose-600"
                  }`}
                >
                  {netProfit >= 0 ? (
                    <HiOutlineTrendingUp className="text-xl" />
                  ) : (
                    <HiOutlineTrendingDown className="text-xl" />
                  )}
                </div>
              </div>
              <div
                className={`text-2xl font-black mt-3 ${
                  netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                }`}
              >
                {formatCurrency(netProfit)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={netProfit >= 0 ? "success" : "danger"} size="sm">
                  Margin: {profitMargin}%
                </Badge>
                <span className="text-[10px] text-slate-400">Net after COGS & OPEX</span>
              </div>
            </Card>

            {/* Total Revenue */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Gross Revenue
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <HiOutlineCash className="text-xl" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {formatCurrency(totalRevenue)}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                From all completed POS & mobile orders
              </span>
            </Card>

            {/* COGS */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cost of Goods (COGS)
                </span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                  <HiOutlineReceiptTax className="text-xl" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {formatCurrency(totalCogs)}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Direct raw ingredients usage cost
              </span>
            </Card>

            {/* Total OPEX */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Operational OPEX
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <HiOutlineCash className="text-xl" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                {formatCurrency(totalOpex)}
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block">
                Utilities, payroll, marketing & maintenance
                {Number(pnlSummary?.total_spoilage_loss) > 0 && (
                  <span className="text-amber-500 font-semibold block mt-0.5">
                    (Includes {formatCurrency(pnlSummary?.total_spoilage_loss || 0)} waste loss)
                  </span>
                )}
              </span>
            </Card>
          </>
        )}
      </div>

      {/* Operational Expenses Distribution & Monthly Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Distribution */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                OPEX by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of store operating expenditures
              </p>
            </div>
            <Link to="/dashboard/manage-expenses">
              <Button variant="ghost" size="sm" className="text-xs text-amber-600">
                View All OPEX <HiOutlineArrowRight className="ml-1" />
              </Button>
            </Link>
          </div>

          {loadingExpenseSummary ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : expensesSummary.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No operational expenses categorized yet.
            </div>
          ) : (
            <div className="space-y-3">
              {expensesSummary.map((cat) => {
                const amount = Number(cat.total_amount || 0);
                const percent = totalOpex > 0 ? ((amount / totalOpex) * 100).toFixed(0) : "0";
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {cat.category}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {cat.count} entries
                        </Badge>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(amount)} ({percent}%)
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(Number(percent), 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Monthly Financial Trend Table */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly gross revenue vs recorded expenses
              </p>
            </div>
            <Badge variant="primary" size="sm">
              Live Aggregate
            </Badge>
          </div>

          {loadingMonthly ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 rounded-xl" />
              ))}
            </div>
          ) : monthlyExpenses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No historical monthly data recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Month</th>
                    <th className="px-3.5 py-2.5 text-right">OPEX Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyExpenses.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-3.5 py-2.5 font-bold font-mono text-amber-600 dark:text-amber-400">
                        {m.month} {m.year ? `(${m.year})` : ""}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-semibold">
                        {formatCurrency(Number(m.total_amount || m.total || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ManageFinancePage;
