import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import Modal from "@/components/ui/Modal.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineCash,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineTruck,
  HiOutlineReceiptTax,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineDocumentReport,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import { useIngredientsQuery } from "@/features/inventory/hooks/useInventory.ts";
import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  usePurchasesQuery,
  usePurchaseDetailQuery,
  useCreatePurchaseMutation,
  useReceivePurchaseMutation,
  usePayPurchaseMutation,
  useExpensesQuery,
  useExpensesSummaryQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useFinancialSummaryQuery,
  useMonthlyExpensesQuery,
} from "../hooks/useFinance.ts";
import type {
  Supplier,
  SupplierFormData,
  PurchaseItemPayload,
  CreateExpensePayload,
  ExpenseCategory,
} from "../types/finance.types.ts";

type FinanceTab = "overview" | "purchases" | "expenses" | "suppliers";

export const ManageFinancePage: React.FC = () => {
  const { canEdit, canCreate, canDelete } = usePermission();
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");

  // Suppliers & Ingredients Queries
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliersQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();

  // Purchases Queries & Mutations
  const [purchaseStatusFilter, setPurchaseStatusFilter] = useState<string>("");
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesQuery(undefined, purchaseStatusFilter || undefined);
  const { mutateAsync: createPurchase, isPending: creatingPO } = useCreatePurchaseMutation();
  const { mutateAsync: receivePurchase, isPending: receivingPO } = useReceivePurchaseMutation();
  const { mutateAsync: payPurchase, isPending: payingPO } = usePayPurchaseMutation();

  // Purchase Modal State
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [poNotes, setPoNotes] = useState<string>("");
  const [poLineItems, setPoLineItems] = useState<PurchaseItemPayload[]>([]);

  // Expenses Queries & Mutations
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("");
  const { data: expenses = [], isLoading: loadingExpenses } = useExpensesQuery(expenseCategoryFilter || undefined);
  const { data: expenseSummary = [] } = useExpensesSummaryQuery();
  const { mutateAsync: createExpense, isPending: creatingExp } = useCreateExpenseMutation();
  const { mutateAsync: deleteExpense } = useDeleteExpenseMutation();

  // Expense Modal State
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState<CreateExpensePayload>({
    category: "UTILITIES",
    amount: 0,
    payment_method: "BANK_TRANSFER",
    recipient: "",
    notes: "",
  });

  // Supplier Modal State
  const { mutateAsync: createSupplier, isPending: creatingSup } = useCreateSupplierMutation();
  const { mutateAsync: updateSupplier, isPending: updatingSup } = useUpdateSupplierMutation();
  const { mutateAsync: deleteSupplier } = useDeleteSupplierMutation();
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierFormData>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    payment_terms: "NET 30",
  });

  // Financial Reports Queries
  const { data: pnlSummary, isLoading: loadingPnl } = useFinancialSummaryQuery();
  const { data: monthlyExpenses = [] } = useMonthlyExpensesQuery();

  // Detail Modal
  const [activePurchaseDetailId, setActivePurchaseDetailId] = useState<string | null>(null);
  const { data: purchaseDetail } = usePurchaseDetailQuery(activePurchaseDetailId);

  // Handlers for PO Line Items
  const handleOpenCreatePO = () => {
    setSelectedSupplierId(suppliers[0]?.id || "");
    setPoNotes("");
    if (rawIngredients.length > 0) {
      setPoLineItems([
        {
          ingredient_id: rawIngredients[0].id,
          quantity: 1000,
          unit_cost: rawIngredients[0].cost_per_unit || 100,
        },
      ]);
    } else {
      setPoLineItems([]);
    }
    setPoModalOpen(true);
  };

  const handleAddPOLine = () => {
    if (rawIngredients.length === 0) return;
    setPoLineItems((prev) => [
      ...prev,
      {
        ingredient_id: rawIngredients[0].id,
        quantity: 100,
        unit_cost: rawIngredients[0].cost_per_unit || 100,
      },
    ]);
  };

  const handleRemovePOLine = (index: number) => {
    setPoLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPOAmount = poLineItems.reduce((acc, item) => acc + item.quantity * item.unit_cost, 0);

  const handleSubmitPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poLineItems.length === 0) return;
    try {
      await createPurchase({
        supplier_id: selectedSupplierId,
        notes: poNotes,
        items: poLineItems,
      });
      setPoModalOpen(false);
    } catch {
      // Handled by mutation onError
    }
  };

  // Handlers for Expense
  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense(expenseForm);
      setExpenseModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  // Handlers for Supplier
  const handleOpenCreateSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      payment_terms: "NET 30",
    });
    setSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (s: Supplier) => {
    setEditingSupplier(s);
    setSupplierForm({
      name: s.name,
      contact_person: s.contact_person || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      payment_terms: s.payment_terms || "NET 30",
    });
    setSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await updateSupplier({ id: editingSupplier.id, data: supplierForm });
      } else {
        await createSupplier(supplierForm);
      }
      setSupplierModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance, Purchasing & Procurement"
        subtitle="Manage supplier procurement, purchase orders, operational expenses, and real-time Profit & Loss reporting."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Finance & Purchasing" },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineDocumentReport className="text-base" />
          Financial P&L Overview
        </button>
        <button
          onClick={() => setActiveTab("purchases")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "purchases"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineReceiptTax className="text-base" />
          Purchase Orders ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "expenses"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineCash className="text-base" />
          Operational Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "suppliers"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineTruck className="text-base" />
          Suppliers Directory ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: FINANCIAL P&L OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {loadingPnl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <Card className="p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <HiOutlineTrendingUp className="text-lg" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {formatCurrency(pnlSummary?.total_revenue || 0)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Gross sales from orders & POS</p>
              </Card>

              {/* COGS (Cost of Goods Sold) */}
              <Card className="p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">COGS (HPP Bahan)</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <HiOutlineReceiptTax className="text-lg" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {formatCurrency(pnlSummary?.cogs || 0)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gross Profit: {formatCurrency(pnlSummary?.gross_profit || 0)} ({pnlSummary?.gross_margin_percent?.toFixed(1) || 0}%)
                </p>
              </Card>

              {/* OPEX */}
              <Card className="p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Operational OPEX</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                    <HiOutlineTrendingDown className="text-lg" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-600 mt-2">
                  {formatCurrency(pnlSummary?.total_expenses || 0)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Rent, electricity, wages, marketing</p>
              </Card>

              {/* Net Profit */}
              <Card className="p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Profit</span>
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                    <HiOutlineCash className="text-lg" />
                  </div>
                </div>
                <div
                  className={`text-2xl font-black mt-2 ${
                    (pnlSummary?.net_profit || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatCurrency(pnlSummary?.net_profit || 0)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Net Margin: {pnlSummary?.net_margin_percent?.toFixed(1) || 0}%
                </p>
              </Card>
            </div>
          )}

          {/* Breakdown & Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Expense Categories Breakdown */}
            <Card className="p-5 border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Expense by Category
              </h4>
              {expenseSummary.length === 0 ? (
                <p className="text-xs text-slate-400">No categorized expenses recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {expenseSummary.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cat.category} ({cat.count})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(cat.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Monthly Trend List */}
            <Card className="lg:col-span-2 p-5 border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Monthly Expense Trend
              </h4>
              {monthlyExpenses.length === 0 ? (
                <p className="text-xs text-slate-400">Monthly expense history will show up here.</p>
              ) : (
                <div className="space-y-2">
                  {monthlyExpenses.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                    >
                      <span className="font-bold">
                        Month {m.month}/{m.year}
                      </span>
                      <span className="font-black text-rose-600">{formatCurrency(m.total_amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS (PO) */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={purchaseStatusFilter}
                onChange={(e) => setPurchaseStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ORDERED">ORDERED</option>
                <option value="RECEIVED">RECEIVED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            {canCreate("inventory") && (
              <Button variant="primary" onClick={handleOpenCreatePO}>
                <HiOutlinePlus className="text-base mr-1" /> Create Purchase Order (PO)
              </Button>
            )}
          </div>

          {loadingPurchases ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : purchases.length === 0 ? (
            <EmptyState
              title="No purchase orders"
              description="Create a purchase order to acquire raw coffee beans, milk, or syrups from vendors."
              icon={<HiOutlineReceiptTax />}
            />
          ) : (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">PO Number & Date</th>
                      <th className="px-5 py-3.5">Supplier</th>
                      <th className="px-5 py-3.5">Total Amount</th>
                      <th className="px-5 py-3.5">Order Status</th>
                      <th className="px-5 py-3.5">Payment</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {purchases.map((po) => {
                      const canReceive = po.status === "ORDERED" || po.status === "DRAFT";
                      const canPay = po.payment_status === "UNPAID";

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white font-mono">{po.po_number}</div>
                            <div className="text-[11px] text-slate-400">{formatDateTime(po.created_at)}</div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                            {po.supplier_name || "Unknown Supplier"}
                          </td>
                          <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                            {formatCurrency(po.total_amount)}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              variant={
                                po.status === "RECEIVED"
                                  ? "success"
                                  : po.status === "ORDERED"
                                  ? "primary"
                                  : po.status === "CANCELLED"
                                  ? "danger"
                                  : "neutral"
                              }
                              size="sm"
                              dot
                            >
                              {po.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={po.payment_status === "PAID" ? "success" : "warning"} size="sm">
                              {po.payment_status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setActivePurchaseDetailId(po.id)}
                                title="View Items Detail"
                                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                View
                              </button>
                              {canReceive && canEdit("inventory") && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => receivePurchase(po.id)}
                                  loading={receivingPO}
                                  title="Receive Items & Auto-Replenish Inventory"
                                >
                                  <HiOutlineCheckCircle className="text-base mr-1" /> Receive
                                </Button>
                              )}
                              {canPay && canEdit("inventory") && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => payPurchase(po.id)}
                                  loading={payingPO}
                                  title="Mark Paid & Book RAW_MATERIAL Expense"
                                >
                                  <HiOutlineCreditCard className="text-base mr-1" /> Pay
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: OPERATIONAL EXPENSES (OPEX) */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="">All Categories</option>
                <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                <option value="RENT">RENT</option>
                <option value="UTILITIES">UTILITIES</option>
                <option value="SALARY">SALARY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="MARKETING">MARKETING</option>
                <option value="LOGISTICS">LOGISTICS</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            {canCreate("inventory") && (
              <Button variant="primary" onClick={() => setExpenseModalOpen(true)}>
                <HiOutlinePlus className="text-base mr-1" /> Record Operational Expense
              </Button>
            )}
          </div>

          {loadingExpenses ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : expenses.length === 0 ? (
            <EmptyState
              title="No expenses recorded"
              description="Record non-cogs operational costs such as electricity, store rent, or staff payroll."
              icon={<HiOutlineCash />}
            />
          ) : (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Recipient / Vendor</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Method</th>
                      <th className="px-5 py-3.5">Notes</th>
                      <th className="px-5 py-3.5 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                          {formatDateTime(exp.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="primary" size="sm">
                            {exp.category}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{exp.recipient}</td>
                        <td className="px-5 py-4 font-black text-rose-600">{formatCurrency(exp.amount)}</td>
                        <td className="px-5 py-4 text-slate-500 font-medium">{exp.payment_method}</td>
                        <td className="px-5 py-4 text-xs text-slate-400">{exp.notes || "-"}</td>
                        <td className="px-5 py-4 text-right">
                          {canDelete("inventory") && (
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10"
                            >
                              <HiOutlineTrash className="text-base" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: SUPPLIERS DIRECTORY */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Registered Vendors</h3>
            {canCreate("inventory") && (
              <Button variant="primary" onClick={handleOpenCreateSupplier}>
                <HiOutlinePlus className="text-base mr-1" /> Add New Supplier
              </Button>
            )}
          </div>

          {loadingSuppliers ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : suppliers.length === 0 ? (
            <EmptyState
              title="No suppliers registered"
              description="Register coffee bean farms, dairy suppliers, and packaging manufacturers."
              icon={<HiOutlineTruck />}
            />
          ) : (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Vendor Name</th>
                      <th className="px-5 py-3.5">Contact Person</th>
                      <th className="px-5 py-3.5">Phone & Email</th>
                      <th className="px-5 py-3.5">Payment Terms</th>
                      <th className="px-5 py-3.5">Address</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {suppliers.map((s) => (
                      <tr key={s.id}>
                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                        <td className="px-5 py-4 font-medium">{s.contact_person || "-"}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          <div>{s.phone || "-"}</div>
                          <div>{s.email || ""}</div>
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="neutral" size="sm">
                            {s.payment_terms || "NET 30"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-400 max-w-xs truncate">{s.address || "-"}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canEdit("inventory") && (
                              <button
                                onClick={() => handleOpenEditSupplier(s)}
                                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                              >
                                <HiOutlinePencil className="text-base" />
                              </button>
                            )}
                            {canDelete("inventory") && (
                              <button
                                onClick={() => deleteSupplier(s.id)}
                                className="p-2 text-rose-600 hover:bg-rose-500/10 rounded-xl"
                              >
                                <HiOutlineTrash className="text-base" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      <Modal show={poModalOpen} handleClose={() => setPoModalOpen(false)} title="Create Purchase Order (PO)">
        <form onSubmit={handleSubmitPO} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Supplier *
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.payment_terms || "NET 30"})
                </option>
              ))}
            </select>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered Materials</span>
              <Button variant="secondary" size="sm" type="button" onClick={handleAddPOLine}>
                <HiOutlinePlus className="text-sm mr-1" /> Add Line
              </Button>
            </div>
            {poLineItems.map((line, idx) => {
              const ing = rawIngredients.find((i) => i.id === line.ingredient_id);
              const subtotal = line.quantity * line.unit_cost;

              return (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <select
                    value={line.ingredient_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selectedIng = rawIngredients.find((i) => i.id === val);
                      setPoLineItems((prev) =>
                        prev.map((r, i) =>
                          i === idx
                            ? {
                                ...r,
                                ingredient_id: val,
                                unit_cost: selectedIng?.cost_per_unit || r.unit_cost,
                              }
                            : r
                        )
                      );
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    {rawIngredients.map((ingItem) => (
                      <option key={ingItem.id} value={ingItem.id}>
                        {ingItem.name} ({ingItem.unit})
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setPoLineItems((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, quantity: val } : r))
                        );
                      }}
                      className="w-20 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                    />
                    <span className="text-[10px] text-slate-400">{ing?.unit}</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    placeholder="Unit Cost"
                    value={line.unit_cost}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPoLineItems((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, unit_cost: val } : r))
                      );
                    }}
                    className="w-24 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                  />
                  <span className="text-xs font-black text-amber-600 w-24 text-right">
                    {formatCurrency(subtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePOLine(idx)}
                    className="p-1 text-rose-600 hover:bg-rose-500/10 rounded"
                  >
                    <HiOutlineTrash className="text-base" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="text-xs font-bold text-slate-500">Total Purchase Amount:</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {formatCurrency(totalPOAmount)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              placeholder="e.g. Expedited delivery for weekend stock"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setPoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingPO}>
              Submit Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: RECORD EXPENSE */}
      <Modal show={expenseModalOpen} handleClose={() => setExpenseModalOpen(false)} title="Record Operational Expense">
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="UTILITIES">UTILITIES (Electricity/Water/Gas)</option>
                <option value="RENT">RENT (Building/Space)</option>
                <option value="SALARY">SALARY (Payroll/Wages)</option>
                <option value="MAINTENANCE">MAINTENANCE (Espresso machine repair)</option>
                <option value="MARKETING">MARKETING (Ads/Flyers)</option>
                <option value="LOGISTICS">LOGISTICS (Transport)</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount (IDR) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient / Payee *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PLN, Landlord, Barista team"
                value={expenseForm.recipient}
                onChange={(e) => setExpenseForm({ ...expenseForm, recipient: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={expenseForm.payment_method}
                onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="BANK_TRANSFER">Bank Transfer (BCA/Mandiri)</option>
                <option value="PETTY_CASH">Petty Cash</option>
                <option value="QRIS">QRIS / E-Wallet</option>
                <option value="CREDIT_CARD">Corporate Card</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reference / Invoice Number
            </label>
            <input
              type="text"
              placeholder="e.g. INV-PLN-NOV-2026"
              value={expenseForm.reference_number || ""}
              onChange={(e) => setExpenseForm({ ...expenseForm, reference_number: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Additional details..."
              value={expenseForm.notes || ""}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingExp}>
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD / EDIT SUPPLIER */}
      <Modal
        show={supplierModalOpen}
        handleClose={() => setSupplierModalOpen(false)}
        title={editingSupplier ? "Edit Supplier" : "Register New Supplier"}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PT Kopi Nusantara Jaya"
              value={supplierForm.name}
              onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Sales Rep Name"
                value={supplierForm.contact_person || ""}
                onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                placeholder="0812xxxx"
                value={supplierForm.phone || ""}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="vendor@example.com"
                value={supplierForm.email || ""}
                onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Terms
              </label>
              <select
                value={supplierForm.payment_terms || "NET 30"}
                onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="NET 7">NET 7 Days</option>
                <option value="NET 14">NET 14 Days</option>
                <option value="NET 30">NET 30 Days</option>
                <option value="NET 60">NET 60 Days</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
            <input
              type="text"
              placeholder="Warehouse / Office address..."
              value={supplierForm.address || ""}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setSupplierModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingSup || updatingSup}>
              {editingSupplier ? "Update Supplier" : "Register Supplier"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VIEW PURCHASE DETAIL */}
      {activePurchaseDetailId && purchaseDetail && (
        <Modal
          show={!!activePurchaseDetailId}
          handleClose={() => setActivePurchaseDetailId(null)}
          title={`Purchase Order: ${purchaseDetail.po_number}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <span className="text-slate-400">Supplier:</span>{" "}
                <span className="font-bold">{purchaseDetail.supplier_name}</span>
              </div>
              <div>
                <Badge variant={purchaseDetail.status === "RECEIVED" ? "success" : "neutral"} size="sm">
                  {purchaseDetail.status}
                </Badge>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2">Quantity</th>
                    <th className="px-3 py-2">Unit Cost</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {purchaseDetail.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2.5 font-bold">{item.ingredient_name || item.ingredient_id}</td>
                      <td className="px-3 py-2.5">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-3 py-2.5">{formatCurrency(item.unit_cost)}</td>
                      <td className="px-3 py-2.5 text-right font-black text-amber-600">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-xs font-bold text-slate-500">Total PO Amount:</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(purchaseDetail.total_amount)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageFinancePage;
