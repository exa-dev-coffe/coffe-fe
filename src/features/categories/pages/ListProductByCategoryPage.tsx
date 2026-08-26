import React from "react";
import { useParams, Link } from "react-router";
import { useMenusByCategoryQuery } from "@/features/categories/hooks/useCategory.ts";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import { HiOutlineArrowLeft, HiOutlineTag, HiStar } from "react-icons/hi";
import type { UncategorizedMenuItem } from "@/features/categories/types/category.types.ts";

export const ListProductByCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? Number(id) : undefined;

  const { data: menuByCategory = [], isLoading: loading } =
    useMenusByCategoryQuery(categoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/manage-category/list-category">
            <Button variant="secondary" size="sm" className="px-2.5">
              <HiOutlineArrowLeft className="text-base" />
            </Button>
          </Link>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Products in Category #{id}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              View all catalog items mapped under this category.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <Skeleton variant="rounded" height={140} />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </div>
          ))}
        </div>
      ) : menuByCategory.length === 0 ? (
        <EmptyState
          icon={<HiOutlineTag />}
          title="No Products In Category"
          description="No items have been assigned to this category yet."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuByCategory.map((item: UncategorizedMenuItem) => (
            <Card key={item.id} variant="default" className="p-4 space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.photo || DummyProduct}
                  alt={item.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DummyProduct;
                  }}
                  className="w-full h-full object-cover"
                />
                {item.rating !== undefined && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-amber-400 text-xs font-bold flex items-center gap-1">
                    <HiStar />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-sm font-black text-amber-600 dark:text-amber-400 pt-1">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListProductByCategoryPage;
