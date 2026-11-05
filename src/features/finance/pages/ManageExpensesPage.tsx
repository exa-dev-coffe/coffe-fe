import React, { useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import Modal from "@/components/ui/Modal.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineCash,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineLightningBolt,
  HiOutlineUserGroup,
  HiOutlineSpeakerphone,
  HiOutlineFolder,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import {
  useExpensesQuery,
  useExpensesSummaryQuery,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
} from "../hooks/useFinance.ts";
import type { CreateExpensePayload, ExpenseCategory } from "../types/finance.types.ts";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "RAW_MATERIAL",
  "RENT",
  "UTILITIES",
  "SALARY",
  "MAINTENANCE",
  "MARKETING",
  "LOGISTICS",
  "OTHER",
];

const getCategoryIcon = (category: string) => {
  switch (category.toUpperCase()) {
    case "UTILITIES":
      return <HiOutlineLightningBolt className="text-amber-500 text-lg" />;
    case "SALARY":
      return <HiOutlineUserGroup className="text-emerald-500 text-lg" />;
    case "MARKETING":
      return <HiOutlineSpeakerphone className="text-purple-500 text-lg" />;
    default:
      return <HiOutlineFolder className="text-slate-400 text-lg" />;
  }
};

export const ManageExpensesPage: React.FC = () => {
  const { canCreate, canDelete } = usePermission();

  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("");
  const { data: expenses = [], isLoading: loadingExpenses } = useExpensesQuery(
    expenseCategoryFilter || undefined
  );
  const { data: rawSummary = [], isLoading: loadingSummary } = useExpensesSummaryQuery();
  const expenseSummary = Array.isArray(rawSummary) ? rawSummary : [];

  const { mutateAsync: createExpense, isPending: creatingExp } = useCreateExpenseMutation();
  const { mutateAsync: deleteExpense } = useDeleteExpenseMutation();

  const categoryFilterOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Categories" },
      ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
    ],
    []
  );

  const categoryFormOptions: DropdownOption[] = useMemo(
    () => EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
    []
  );

  const paymentMethodOptions: DropdownOption[] = useMemo(
    () => [
      { value: "CASH", label: "Cash" },
      { value: "BANK_TRANSFER", label: "Bank Transfer" },
      { value: "CREDIT_CARD", label: "Credit Card" },
    ],
    []
  );

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState<CreateExpensePayload>({
    category: "UTILITIES",
    amount: 0,
    payment_method: "CASH",
    recipient: "",
    notes: "",
  });

  const totalOpex = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.recipient || expenseFormData.amount <= 0) return;

    await createExpense({
      ...expenseFormData,
      amount: Number(expenseFormData.amount),
    });
    setExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Operational Expenses"
        subtitle="Track store operating expenditures, utilities, staff payroll, maintenance, and overheads"
        action={
          canCreate("expense") && (
            <Button variant="primary" onClick={() => setExpenseModalOpen(true)}>
              <HiOutlinePlus className="text-base mr-1.5" /> Record Operational Expense
            </Button>
          )
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Total Recorded OPEX
            </span>
            <HiOutlineCash className="text-xl text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-white mt-2">
            {formatCurrency(totalOpex)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Across {expenses.length} transaction entries
          </span>
        </Card>

        {loadingSummary
          ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : expenseSummary.slice(0, 3).map((cat) => (
              <Card key={cat.category} className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 truncate">
                    {cat.category}
                  </span>
                  {getCategoryIcon(cat.category)}
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(Number(cat.total_amount || 0))}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {cat.count} recorded entries
                </span>
              </Card>
            ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-64 pb-1">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Category:</span>
          <Dropdown
            size="sm"
            options={categoryFilterOptions}
            value={categoryFilterOptions.find((c) => c.value === expenseCategoryFilter) || categoryFilterOptions[0]}
            setValue={(opt) => setExpenseCategoryFilter(opt?.value ? String(opt.value) : "")}
          />
        </div>
      </div>

      {loadingExpenses ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : !Array.isArray(expenses) || expenses.length === 0 ? (
        <EmptyState
          title="No expenses recorded"
          description="Record non-COGS operational costs such as electricity, store rent, or staff payroll."
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
                  <th className="px-5 py-3.5">Recipient / Description</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Notes</th>
                  <th className="px-5 py-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(exp.created_at || exp.expense_date)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="primary" size="sm">
                        {exp.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      {exp.recipient}
                    </td>
                    <td className="px-5 py-4 font-black text-rose-600">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{exp.payment_method}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{exp.notes || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      {canDelete("expense") && (
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          title="Delete Expense"
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

      {/* MODAL: RECORD EXPENSE */}
      <Modal
        show={expenseModalOpen}
        handleClose={() => setExpenseModalOpen(false)}
        title="Record Operational Expense"
      >
        <form onSubmit={handleSubmitExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Dropdown
                label="Category *"
                placeholder="Select category..."
                options={categoryFormOptions}
                value={categoryFormOptions.find((c) => c.value === expenseFormData.category) || null}
                setValue={(opt) =>
                  setExpenseFormData({
                    ...expenseFormData,
                    category: (opt?.value ? String(opt.value) : "OTHER") as ExpenseCategory,
                  })
                }
                required
              />
            </div>
            <div>
              <Dropdown
                label="Payment Method"
                placeholder="Select method..."
                options={paymentMethodOptions}
                value={paymentMethodOptions.find((p) => p.value === expenseFormData.payment_method) || null}
                setValue={(opt) =>
                  setExpenseFormData({
                    ...expenseFormData,
                    payment_method: opt?.value ? String(opt.value) : "CASH",
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Recipient / Payee Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PLN Electricity, Store Landlord, Barista Payroll"
              value={expenseFormData.recipient}
              onChange={(e) =>
                setExpenseFormData({ ...expenseFormData, recipient: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (IDR) *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="1000"
              placeholder="500000"
              value={expenseFormData.amount || ""}
              onChange={(e) =>
                setExpenseFormData({
                  ...expenseFormData,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={expenseFormData.notes}
              onChange={(e) =>
                setExpenseFormData({ ...expenseFormData, notes: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              placeholder="e.g. Monthly maintenance contract payment"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingExp}>
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageExpensesPage;
