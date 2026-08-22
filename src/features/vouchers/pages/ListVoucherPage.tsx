import React, { useState } from "react";
import {
  useVoucherQuery,
  useCreateVoucherMutation,
  useDeleteVoucherMutation,
  useToggleVoucherStatusMutation,
} from "@/features/vouchers/hooks/useVoucher.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency, formatDateTimeWIB } from "@/core/utils/formatters.ts";
import {
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
} from "react-icons/hi";
import { extractFormErrors } from "@/core/utils/validation.ts";
import type { VoucherItem, VoucherFormData } from "../types/voucher.types.ts";
import VoucherFormModal from "../components/VoucherFormModal.tsx";

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

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    searchDebounce(val);
  };

  const handleCreateVoucherSubmit = async (formData: VoucherFormData) => {
    await createVoucher(formData);
    setModalOpen(false);
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
          onClick={() => setModalOpen(true)}
        >
          Add Voucher Code
        </Button>
      </div>

      {/* Modal: Add Voucher */}
      <VoucherFormModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateVoucherSubmit}
        loading={createLoading}
        errors={errors}
      />

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
          onAction={() => setModalOpen(true)}
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
                  <th className="px-6 py-4">Tipe Tampil</th>
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
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {voucher.discountType === "PERCENTAGE"
                              ? `${voucher.discountValue}%`
                              : formatCurrency(voucher.discountValue)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              voucher.discountType === "PERCENTAGE"
                                ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {voucher.discountType === "PERCENTAGE"
                              ? "Percentage"
                              : "Nominal"}
                          </span>
                        </div>
                        {voucher.discountType === "PERCENTAGE" &&
                          voucher.maxDiscount > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
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
                      <td className="px-6 py-4.5 font-semibold text-slate-600 dark:text-slate-300">
                        <button
                          type="button"
                          disabled={isExpired}
                          onClick={() =>
                            !isExpired &&
                            toggleStatus({
                              id: voucher.id,
                              isPublic: voucher.isPublic === false ? true : false,
                            })
                          }
                          title={
                            isExpired
                              ? "Voucher kedaluwarsa tidak dapat diubah visibilitasnya"
                              : "Klik untuk ubah visibilitas (Publik / Khusus Input)"
                          }
                          className={`transition-opacity ${
                            isExpired
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer hover:opacity-80"
                          }`}
                        >
                          {voucher.isPublic !== false ? (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Publik (Daftar)
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Khusus Input (Rahasia)
                            </span>
                          )}
                        </button>
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
                        {formatDateTimeWIB(voucher.expiredAt)}
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
