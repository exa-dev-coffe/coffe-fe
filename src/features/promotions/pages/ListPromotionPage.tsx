import React, { useState } from "react";
import {
  usePromotionQuery,
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useTogglePromotionStatusMutation,
} from "@/features/promotions/hooks/usePromotions.ts";
import { useMenuOptionsQuery } from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency, formatDateTimeWIB } from "@/core/utils/formatters.ts";
import {
  HiOutlineBadgeCheck,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineTag,
} from "react-icons/hi";
import { extractFormErrors } from "@/core/utils/validation.ts";
import type {
  PromotionItem,
  PromotionFormData,
} from "../types/promotion.types.ts";
import PromotionFormModal from "../components/PromotionFormModal.tsx";
import type { CategoryItem } from "@/features/categories/types/category.types.ts";
import type { MenuItem } from "@/features/menu/types/menu.types.ts";

export const ListPromotionPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 400);

  const { data: promoData, isLoading: queryLoading } = usePromotionQuery(
    page,
    10,
    debouncedSearch,
  );
  const { data: menuOptionsData } = useMenuOptionsQuery();
  const { data: categoryOptionsData } = useCategoryOptionsQuery();

  const {
    mutateAsync: createPromotion,
    isPending: createLoading,
    error: createError,
  } = useCreatePromotionMutation();
  const { mutateAsync: deletePromotion, isPending: deleteLoading } =
    useDeletePromotionMutation();
  const { mutate: toggleStatus } = useTogglePromotionStatusMutation();

  const data = promoData?.data || [];
  const totalData = promoData?.totalData || 0;
  const menuOptions = menuOptionsData || [];
  const categoryOptions = categoryOptionsData || [];

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

  const handleCreatePromotionSubmit = async (formData: PromotionFormData) => {
    await createPromotion(formData);
    setModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deletePromotion(deleteModalState.id);
      setDeleteModalState({ open: false, id: null });
    } catch {
      setDeleteModalState({ open: false, id: null });
    }
  };

  const errors = extractFormErrors<PromotionFormData>(createError);

  const getTargetLabel = (promo: PromotionItem) => {
    if (promo.targetType === "ALL") return "Storewide (Semua Menu)";

    if (promo.targetType === "PRODUCT") {
      let name = promo.targetName;
      if (!name && promo.targetId) {
        const item = menuOptions.find((m: MenuItem) => m.id === promo.targetId);
        name = item ? item.name : `#${promo.targetId}`;
      }
      return `Product: ${name || "Specific Menu"}`;
    }

    if (promo.targetType === "CATEGORY") {
      let name = promo.targetName;
      if (!name && promo.targetId) {
        const cat = categoryOptions.find(
          (c: CategoryItem) => c.id === promo.targetId,
        );
        name = cat ? cat.name : `#${promo.targetId}`;
      }
      return `Category: ${name || "Menu Category"}`;
    }

    return "Storewide (All Menus)";
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search & Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search promotion campaigns..."
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
          Create Promo Campaign
        </Button>
      </div>

      {/* Modal: Add Promotion */}
      <PromotionFormModal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreatePromotionSubmit}
        loading={createLoading}
        errors={errors}
        menuOptions={menuOptions}
        categoryOptions={categoryOptions}
      />

      {/* Table List */}
      {queryLoading && data.length === 0 ? (
        <div className="space-y-3">
          <Skeleton variant="rounded" height={60} />
          <Skeleton variant="rounded" height={300} />
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HiOutlineBadgeCheck />}
          title="No Promotions Found"
          description="Create campaign promotions for specific menu items, categories, or storewide sales."
          actionLabel="Create Promo"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Target Scope</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {data.map((promo: PromotionItem) => {
                  const now = new Date();
                  const startDate = new Date(promo.startAt);
                  const endDate = new Date(promo.endAt);
                  const isExpired = endDate < now;
                  const isUpcoming = startDate > now;

                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100">
                            {promo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${
                            promo.targetType === "PRODUCT"
                              ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/10"
                              : promo.targetType === "CATEGORY"
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10"
                          }`}
                        >
                          <HiOutlineTag className="text-xs" />
                          {getTargetLabel(promo)}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {promo.discountType === "PERCENTAGE"
                            ? `${promo.discountValue}% OFF`
                            : formatCurrency(promo.discountValue)}
                        </div>
                        {promo.discountType === "PERCENTAGE" &&
                          promo.maxDiscount > 0 && (
                            <div className="text-[10px] text-slate-400">
                              Max Cap: {formatCurrency(promo.maxDiscount)}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          type="button"
                          disabled={isExpired}
                          onClick={() =>
                            !isExpired &&
                            toggleStatus({
                              id: promo.id,
                              isActive: !promo.isActive,
                            })
                          }
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black transition-all border ${
                            isExpired
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700/80 cursor-not-allowed opacity-60"
                              : promo.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer"
                                : isUpcoming
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10 hover:bg-blue-500/20 cursor-pointer"
                                  : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/10 hover:bg-slate-500/20 cursor-pointer"
                          }`}
                          title={
                            isExpired
                              ? "Expired promotions cannot be toggled"
                              : `Click to ${promo.isActive ? "deactivate" : "activate"}`
                          }
                        >
                          {isExpired
                            ? "Expired"
                            : promo.isActive
                              ? "Active"
                              : isUpcoming
                                ? "Scheduled"
                                : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <div>{formatDateTimeWIB(promo.startAt)}</div>
                        <div className="text-slate-400 mt-0.5">
                          s/d {formatDateTimeWIB(promo.endAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteModalState({ open: true, id: promo.id })
                          }
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center"
                          title="Delete Promotion"
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
        title="Delete Promotion Campaign"
        description="Are you sure you want to delete this promotion campaign? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ListPromotionPage;
