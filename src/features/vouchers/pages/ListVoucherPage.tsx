import React, { useState, useEffect } from "react";
import {
  useVoucherQuery,
  useCreateVoucherMutation,
  useDeleteVoucherMutation,
  useToggleVoucherStatusMutation,
} from "@/features/vouchers/hooks/useVoucher.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Input from "@/components/ui/Input.tsx";
import Button from "@/components/ui/Button.tsx";
import Card from "@/components/ui/Card.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import {
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiX,
} from "react-icons/hi";
import { extractFormErrors } from "@/core/utils/validation.ts";
import type { VoucherItem, VoucherFormData } from "../types/voucher.types.ts";

export const ListVoucherPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 400);

  const { data: voucherData, isLoading: queryLoading } = useVoucherQuery(
    page,
    10,
    debouncedSearch
  );
  const {
    mutateAsync: createVoucher,
    isPending: createLoading,
    error: createError,
  } = useCreateVoucherMutation();
  const { mutateAsync: deleteVoucher, isPending: deleteLoading } =
    useDeleteVoucherMutation();
  const { mutate: toggleStatus } = useToggleVoucherStatusMutation();

  const data = voucherData?.data || [];
  const totalData = voucherData?.totalData || 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: 0,
    maxDiscount: 0,
    minPurchase: 0,
    quota: -1,
    expiredAt: "",
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });

  const [discountValueInput, setDiscountValueInput] = useState("");
  const [maxDiscountInput, setMaxDiscountInput] = useState("");
  const [minPurchaseInput, setMinPurchaseInput] = useState("");

  const formatInputNumber = (val: string) => {
    const rawValue = val.replace(/\D/g, "");
    if (!rawValue) return "";
    return new Intl.NumberFormat("id-ID").format(Number(rawValue));
  };

  const getRawNumber = (val: string) => {
    return Number(val.replace(/\D/g, "")) || 0;
  };

  useEffect(() => {
    if (!drawerOpen) {
      setForm({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxDiscount: 0,
        minPurchase: 0,
        quota: -1,
        expiredAt: "",
      });
      setDiscountValueInput("");
      setMaxDiscountInput("");
      setMinPurchaseInput("");
    }
  }, [drawerOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    searchDebounce(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the expired_at to include timezone (e.g. Z or local format)
      // Since input datetime-local returns "YYYY-MM-DDTHH:MM", we append ":00Z" to represent ISO string
      const isoExpiredAt = form.expiredAt ? new Date(form.expiredAt).toISOString() : "";
      
      await createVoucher({
        ...form,
        expiredAt: isoExpiredAt,
      });

      setDrawerOpen(false);
    } catch {
      // Handled
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deleteVoucher(deleteModalState.id);
      setDeleteModalState({ open: false, id: null });
    } catch {
      setDeleteModalState({ open: false, id: null });
    }
  };

  const errors = extractFormErrors<VoucherFormData>(createError);

  return (
    <div className="space-y-6">
      {/* Top Bar: Search & Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search voucher codes..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
          />
        </div>

        <Button
          variant="primary"
          leftIcon={<HiOutlinePlus />}
          onClick={() => setDrawerOpen(true)}
        >
          Add Voucher Code
        </Button>
      </div>

      {/* Drawer: Add Voucher */}
      {drawerOpen && (
        <Card
          variant="dashboard"
          className="border-amber-500/30 bg-amber-500/5 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Voucher Code
            </h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Voucher Code"
                placeholder="e.g. KOPIHEMAT, CHILLCOFFEE"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                error={errors.code}
                required
              />

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Discount Type
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENTAGE" | "FIXED" })}
                  className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 focus-ring"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (Rp)</option>
                </select>
              </div>

              <Input
                label={form.discountType === "PERCENTAGE" ? "Discount Value (%)" : "Discount Value (Rp)"}
                type={form.discountType === "PERCENTAGE" ? "number" : "text"}
                placeholder={form.discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 10.000"}
                value={form.discountType === "PERCENTAGE" ? form.discountValue || "" : discountValueInput}
                onChange={(e) => {
                  if (form.discountType === "PERCENTAGE") {
                    const val = Number(e.target.value);
                    setForm({ ...form, discountValue: val });
                    setDiscountValueInput(formatInputNumber(e.target.value));
                  } else {
                    const formatted = formatInputNumber(e.target.value);
                    setDiscountValueInput(formatted);
                    setForm({ ...form, discountValue: getRawNumber(formatted) });
                  }
                }}
                error={errors.discountValue}
                required
              />

              {form.discountType === "PERCENTAGE" && (
                <Input
                  label="Max Discount Cap (Rp) - 0 if unlimited"
                  type="text"
                  placeholder="e.g. 15.000"
                  value={maxDiscountInput}
                  onChange={(e) => {
                    const formatted = formatInputNumber(e.target.value);
                    setMaxDiscountInput(formatted);
                    setForm({ ...form, maxDiscount: getRawNumber(formatted) });
                  }}
                  error={errors.maxDiscount}
                />
              )}

              <Input
                label="Min Purchase Requirement (Rp)"
                type="text"
                placeholder="e.g. 30.000"
                value={minPurchaseInput}
                onChange={(e) => {
                  const formatted = formatInputNumber(e.target.value);
                  setMinPurchaseInput(formatted);
                  setForm({ ...form, minPurchase: getRawNumber(formatted) });
                }}
                error={errors.minPurchase}
              />

              <Input
                label="Usage Quota - -1 if unlimited"
                type="number"
                placeholder="e.g. 100"
                value={form.quota || ""}
                onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })}
                error={errors.quota}
              />

              <div className="md:col-span-2">
                <Input
                  label="Expiry Date & Time"
                  type="datetime-local"
                  value={form.expiredAt}
                  onChange={(e) => setForm({ ...form, expiredAt: e.target.value })}
                  error={errors.expiredAt}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" loading={createLoading}>
                Create Voucher
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDrawerOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Table List */}
      {queryLoading && data.length === 0 ? (
        <div className="space-y-3">
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={300} />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HiOutlineTicket />}
          title="No Vouchers Found"
          description="Get started by creating your first promotional voucher code."
          actionLabel="Create Voucher"
          onAction={() => setDrawerOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4">Voucher Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Min. Purchase</th>
                  <th className="px-6 py-4">Quota</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {data.map((voucher: VoucherItem) => {
                  const isExpired = new Date(voucher.expiredAt) < new Date();
                  const isActive = voucher.isActive && !isExpired;

                  return (
                    <tr key={voucher.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white">
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black tracking-wider text-xs border border-amber-500/10">
                          {voucher.code}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {voucher.discountType === "PERCENTAGE"
                            ? `${voucher.discountValue}%`
                            : formatCurrency(voucher.discountValue)}
                        </div>
                        {voucher.discountType === "PERCENTAGE" && voucher.maxDiscount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            Max Cap: {formatCurrency(voucher.maxDiscount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-600 dark:text-slate-300">
                        {voucher.minPurchase > 0 ? formatCurrency(voucher.minPurchase) : "None"}
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-slate-600 dark:text-slate-300">
                        {voucher.quota === -1 ? (
                          <span className="text-slate-400 text-xs italic">Unlimited</span>
                        ) : (
                          voucher.quota
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          type="button"
                          onClick={() => !isExpired && toggleStatus({ id: voucher.id, isActive: !voucher.isActive })}
                          disabled={isExpired}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                            isExpired
                              ? "bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/80 cursor-not-allowed"
                              : isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10 hover:bg-amber-500/20 cursor-pointer"
                          }`}
                          title={isExpired ? "Expired vouchers cannot be toggled" : `Click to ${isActive ? "deactivate" : "activate"}`}
                        >
                          {isActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400 font-medium">
                        {new Date(voucher.expiredAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteModalState({ open: true, id: voucher.id })}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Delete Voucher"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalData={totalData}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModalState.open}
        onClose={() => setDeleteModalState({ open: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Voucher"
        description="Are you sure you want to delete this voucher? This cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ListVoucherPage;
