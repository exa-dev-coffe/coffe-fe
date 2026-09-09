import React from "react";
import DummyProduct from "@/assets/images/dummyProduct.png";

export type ProductImageVariant = "card" | "detail" | "thumbnail";
export type ProductImageSize = "xs" | "sm" | "md" | "lg" | "full";

export interface ProductImageProps {
  src?: string | null;
  alt?: string;
  variant?: ProductImageVariant;
  size?: ProductImageSize;
  className?: string;
  imageClassName?: string;
  hoverZoom?: boolean;
  priority?: boolean;
  children?: React.ReactNode;
}

/**
 * Standardized Product/Menu Image Component
 * Ensures exact, uniform 4:3 proportions across all menu-related components in the app
 * (Cards, POS, Detail, Cart, Orders, Inventory, and Dashboard).
 */
export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = "Menu photo",
  variant = "card",
  size = "md",
  className = "",
  imageClassName = "",
  hoverZoom = false,
  priority = false,
  children,
}) => {
  const getContainerClasses = (): string => {
    if (variant === "card") {
      return `relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`;
    }

    if (variant === "detail") {
      return `relative aspect-[4/3] w-full max-h-[460px] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`;
    }

    // variant === "thumbnail"
    const sizeClasses: Record<ProductImageSize, string> = {
      xs: "w-12 aspect-[4/3] rounded-xl",
      sm: "w-14 aspect-[4/3] rounded-xl",
      md: "w-20 aspect-[4/3] rounded-2xl",
      lg: "w-24 sm:w-28 aspect-[4/3] rounded-2xl",
      full: "w-full aspect-[4/3] rounded-2xl",
    };

    return `relative overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${sizeClasses[size]} ${className}`;
  };

  const getImageClasses = (): string => {
    const zoomClass = hoverZoom
      ? "transition-transform duration-500 group-hover:scale-105"
      : "";
    return `w-full h-full object-cover object-center ${zoomClass} ${imageClassName}`;
  };

  return (
    <div className={getContainerClasses()}>
      <img
        src={src || DummyProduct}
        alt={alt}
        loading={priority ? undefined : "lazy"}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DummyProduct;
        }}
        className={getImageClasses()}
      />
      {children}
    </div>
  );
};

export default ProductImage;
