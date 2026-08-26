import React from "react";
import type { MenuItem } from "@/features/menu/types/menu.types.ts";
import { formatCurrency } from "@/core/utils/formatters.ts";
import { HiOutlinePlus, HiOutlineSparkles } from "react-icons/hi";

interface PosMenuCardProps {
  item: MenuItem;
  inCartQty: number;
  onAddToCart: (item: MenuItem) => void;
}

export const PosMenuCard: React.FC<PosMenuCardProps> = ({
  item,
  inCartQty,
  onAddToCart,
}) => {
  const isOutOfStock = item.isAvailable === false;
  const hasDiscount = item.discount && item.discount.savings > 0;
  const effectivePrice = (hasDiscount && item.effectivePrice) ? item.effectivePrice : item.price;

  return (
    <div
      onClick={() => {
        if (!isOutOfStock) {
          onAddToCart(item);
        }
      }}
      className={`group relative flex flex-col bg-white dark:bg-slate-900 border rounded-3xl overflow-hidden transition-all duration-200 select-none ${
        isOutOfStock
          ? "opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800"
          : inCartQty > 0
          ? "border-amber-500 shadow-md shadow-amber-500/10 scale-[1.01] cursor-pointer hover:border-amber-500 hover:shadow-lg"
          : "border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      }`}
    >
      {/* Top Media / Thumbnail */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
            No Photo
          </div>
        )}

        {/* Promo Discount Tag */}
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <HiOutlineSparkles className="text-amber-300" />
            <span>
              {item.discount?.discountType === "PERCENTAGE"
                ? `${item.discount.discountValue}% OFF`
                : "PROMO"}
            </span>
          </div>
        )}

        {/* In-Cart Active Counter Badge */}
        {inCartQty > 0 && !isOutOfStock && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-amber-500/30 animate-scale-in">
            {inCartQty}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-2 text-center">
            <span className="px-2.5 py-1 rounded-xl bg-rose-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
            <span>{item.categoryName || "Specialty"}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-1 leading-snug">
            {item.name}
          </h4>
        </div>

        {/* Price & Add Indicator */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            {hasDiscount && (
              <span className="text-[10px] font-semibold text-slate-400 line-through block -mb-0.5">
                {formatCurrency(item.price)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
              {formatCurrency(effectivePrice)}
            </span>
          </div>

          {!isOutOfStock && (
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center text-sm font-bold shadow-sm">
              <HiOutlinePlus />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosMenuCard;
