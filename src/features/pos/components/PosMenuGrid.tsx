import React from "react";
import type { MenuItem } from "@/features/menu/types/menu.types.ts";
import type { CategoryItem } from "@/features/categories/types/category.types.ts";
import PosMenuCard from "@/features/pos/components/PosMenuCard.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { HiOutlineEmojiSad } from "react-icons/hi";

interface PosMenuGridProps {
  menus: MenuItem[];
  categories: CategoryItem[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  cartItemQuantities: Record<number, number>;
  onAddToCart: (item: MenuItem) => void;
  isLoading: boolean;
}

export const PosMenuGrid: React.FC<PosMenuGridProps> = ({
  menus,
  categories,
  selectedCategoryId,
  onSelectCategory,
  cartItemQuantities,
  onAddToCart,
  isLoading,
}) => {
  return (
    <div className="space-y-4 flex-1 flex flex-col min-h-0">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
            selectedCategoryId === null
              ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-[1.02]"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40"
          }`}
        >
          All Items ({menus.length})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = menus.filter((m) => m.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Menus Grid Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 space-y-3"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
            <HiOutlineEmojiSad className="text-4xl text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No menu items found
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Try choosing another category or clearing your search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-6">
            {menus.map((item) => (
              <PosMenuCard
                key={item.id}
                item={item}
                inCartQty={cartItemQuantities[item.id] || 0}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PosMenuGrid;
