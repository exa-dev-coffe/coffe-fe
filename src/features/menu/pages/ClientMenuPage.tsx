import React, { useState } from "react";
import { useMenusInfiniteQuery } from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import useDebounce from "@/core/hooks/useDebounce.ts";
import MenuCard from "@/features/menu/components/MenuCard.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import { CardSkeleton } from "@/components/ui/Skeleton.tsx";
import { HiOutlineSearch, HiBookOpen, HiRefresh } from "react-icons/hi";
import type { CategoryItem } from "@/features/categories/types/category.types";

export const ClientMenuPage: React.FC = () => {
  const { data: categories = [] } = useCategoryOptionsQuery();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const searchDebounce = useDebounce((val: string) => {
    setDebouncedSearch(val);
  }, 400);

  const {
    data: infiniteData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMenusInfiniteQuery(12, debouncedSearch, selectedCategory);

  const data = infiniteData?.pages.flatMap((page) => page.data) || [];
  // We can get the totalData from the first page since it includes it
  // Wait, the infinite query returns `data` arrays, the totalData wasn't passed through but it doesn't strictly matter if we just show the length of fetched items.
  // Actually, I can just use `data.length`.
  const totalLoaded = data.length;

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    searchDebounce(val);
  };

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-400/15 px-3.5 py-1 rounded-full border border-amber-500/20">
            Artisan Menu
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Crafted to Perfection
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Discover our signature espresso roasts, handcrafted brew varieties,
            refreshing mocktails, and fresh artisanal pastries.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
              <input
                type="text"
                placeholder="Search our artisan drinks & food..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring shadow-sm"
              />
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 self-end sm:self-center">
              Loaded{" "}
              <span className="text-amber-600 dark:text-amber-400">
                {totalLoaded}
              </span>{" "}
              items
            </span>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm ${
                selectedCategory === null
                  ? "bg-amber-600 text-white shadow-amber-500/20 scale-105"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat: CategoryItem) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-sm ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-amber-500/20 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Grid */}
        {isLoading && data.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyState
            icon={<HiBookOpen />}
            title="No Coffee Items Found"
            description="Try modifying your search or picking a different category."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch("");
              setDebouncedSearch("");
              setSelectedCategory(null);
            }}
          />
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.map((item) => (
                <MenuCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  effectivePrice={item.effectivePrice}
                  discount={item.discount}
                  photo={item.photo}
                  rating={item.rating}
                  isAvailable={item.isAvailable}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={
                    <HiRefresh
                      className={isFetchingNextPage ? "animate-spin" : ""}
                    />
                  }
                  loading={isFetchingNextPage}
                  onClick={handleLoadMore}
                  className="px-8"
                >
                  Load More Items
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientMenuPage;
