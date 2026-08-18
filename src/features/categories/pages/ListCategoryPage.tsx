import React, { useState } from "react";
import {
  useCategoryQuery,
  useAddCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/categories/hooks/useCategory.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import CategoryCard from "@/features/categories/components/CategoryCard.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import ConfirmModal from "@/components/shared/ConfirmModal.tsx";
import Input from "@/components/ui/Input.tsx";
import Button from "@/components/ui/Button.tsx";
import Card from "@/components/ui/Card.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineSearch,
  HiX,
} from "react-icons/hi";
import DynamicIcon from "@/components/ui/DynamicIcon.tsx";
import { ICON_NAMES } from "@/core/constants/iconRegistry.ts";
import type { CategoryItem } from "../types/category.types";

export const ListCategoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 400);

  const { data: categoryData, isLoading: queryLoading } = useCategoryQuery(
    page,
    10,
    debouncedSearch,
  );
  const {
    mutateAsync: addCategory,
    isPending: addLoading,
    error: addError,
  } = useAddCategoryMutation();
  const { mutateAsync: deleteCategory, isPending: deleteLoading } =
    useDeleteCategoryMutation();

  const data = categoryData?.data || [];
  const totalData = categoryData?.totalData || 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [iconInput, setIconInput] = useState<string>("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory({ name: nameInput, icon: iconInput });
      setDrawerOpen(false);
      setNameInput("");
      setIconInput("");
    } catch {
      // Error caught and handled
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalState.id) return;
    try {
      await deleteCategory(deleteModalState.id);
      setDeleteModalState({ open: false, id: null });
    } catch {
      setDeleteModalState({ open: false, id: null });
    }
  };

  const errors = (addError as unknown as Record<string, string>) || {};

  return (
    <div className="space-y-6">
      {/* Top Bar: Search & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
          <input
            type="text"
            placeholder="Search categories..."
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
          Add Category
        </Button>
      </div>

      {/* Inline Add Category Card */}
      {drawerOpen && (
        <Card
          variant="dashboard"
          className="border-amber-500/30 bg-amber-500/5 animate-fade-in"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Category
            </h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-md">
            <Input
              label="Category Name"
              placeholder="e.g. Espresso Special, Pastry & Bakery"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              error={errors.name}
              required
            />

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Category Icon
              </label>
              <div className="grid grid-cols-8 gap-2">
                {ICON_NAMES.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() =>
                      setIconInput(iconName === iconInput ? "" : iconName)
                    }
                    className={`flex items-center justify-center p-2 rounded-xl text-xl transition-all ${
                      iconInput === iconName
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <DynamicIcon name={iconName} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary" loading={addLoading}>
                Save Category
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

      {/* Content List */}
      {queryLoading && data.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="text" width="50%" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          icon={<HiOutlineTag />}
          title="No Categories Found"
          description="Get started by creating your first product category."
          actionLabel="Create Category"
          onAction={() => setDrawerOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((category: CategoryItem) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                icon={category.icon}
                productCount={category.productCount}
                onDelete={(id) => setDeleteModalState({ open: true, id })}
              />
            ))}
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
        title="Delete Category"
        description="Are you sure you want to delete this category? Menus in this category will be unassigned."
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ListCategoryPage;
