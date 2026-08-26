import React, { useState } from "react";
import {
  useUncategorizedMenuQuery,
  useSetCategoryMenuMutation,
  useCategoryOptionsQuery,
} from "@/features/categories/hooks/useCategory.ts";
import UncategorizedMenuCard from "@/features/categories/components/UncategorizedMenuCard.tsx";
import Pagination from "@/components/shared/Pagination.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import type {
  CategoryItem,
  UncategorizedMenuItem,
} from "@/features/categories/types/category.types";

export const ListUncategorizedPage: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data: uncategorizedResponse, isLoading: loading } =
    useUncategorizedMenuQuery(page, 10);
  const { mutateAsync: setCategoryMenu } = useSetCategoryMenuMutation();
  const { data: categories = [] } = useCategoryOptionsQuery();

  const uncategorizedData = uncategorizedResponse?.data || [];
  const totalData = uncategorizedResponse?.totalData || 0;

  const optionsCategory = categories.map((c: CategoryItem) => ({
    value: Number(c.id),
    label: c.name,
  }));

  const handleAssign = async (menuId: number, categoryId: number) => {
    try {
      await setCategoryMenu({ id: menuId, categoryId });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Uncategorized Items
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assign each product to its respective category so it appears
            correctly in customer filters.
          </p>
        </div>
      </div>

      {loading && uncategorizedData.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4"
            >
              <Skeleton variant="rounded" height={80} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rounded" height={36} />
            </div>
          ))}
        </div>
      ) : uncategorizedData.length === 0 ? (
        <EmptyState
          icon={<HiOutlineQuestionMarkCircle />}
          title="All Menus Categorized"
          description="Awesome! There are no uncategorized menu items remaining in the catalog."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uncategorizedData.map((item: UncategorizedMenuItem) => (
              <UncategorizedMenuCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                photo={item.photo}
                optionsCategory={optionsCategory}
                onAssignCategory={handleAssign}
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
    </div>
  );
};

export default ListUncategorizedPage;
