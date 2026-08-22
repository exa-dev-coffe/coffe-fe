import React from "react";
import {Link} from "react-router";
import Card from "@/components/ui/Card.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {HiStar, HiArrowRight} from "react-icons/hi";

export interface MenuCardProps {
    id: number;
    name: string;
    description: string;
    price: number;
    effectivePrice?: number;
    discount?: {
        promotionName?: string;
        discountType?: string;
        discountValue?: number;
        savings?: number;
    };
    photo: string;
    rating?: number;
    isAvailable?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    id,
    name,
    description,
    price,
    effectivePrice,
    discount,
    photo,
    rating,
    isAvailable = true,
}) => {
    const finalPrice = effectivePrice && effectivePrice < price ? effectivePrice : price;
    const hasDiscount = effectivePrice && effectivePrice < price;

    return (
        <Link to={`/menu/${id}`} className="block h-full group">
            <Card
                variant="interactive"
                padding="none"
                className="h-full flex flex-col justify-between overflow-hidden relative border border-slate-200/80 dark:border-slate-800"
            >
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                        src={photo || DummyProduct}
                        alt={name}
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DummyProduct;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {!isAvailable && (
                            <Badge variant="danger" size="sm">
                                Sold Out
                            </Badge>
                        )}
                        {isAvailable && hasDiscount && (
                            <Badge variant="warning" size="sm">
                                {discount?.discountType === "PERCENTAGE" 
                                    ? `${discount.discountValue}% OFF` 
                                    : discount?.savings || discount?.discountValue
                                        ? `-${formatCurrency(discount.savings || discount.discountValue || 0)}`
                                        : "PROMO"}
                            </Badge>
                        )}
                    </div>

                    {rating !== undefined && rating > 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1 shadow-sm">
                            <HiStar className="text-sm" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                            {name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {description || "Artisanal beverage crafted with finest ingredients."}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block -mb-0.5">
                                Price
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                {hasDiscount && (
                                    <span className="line-through text-xs text-slate-400 font-semibold">
                                        {formatCurrency(price)}
                                    </span>
                                )}
                                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                                    {formatCurrency(finalPrice)}
                                </span>
                            </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm transition-transform group-hover:translate-x-1">
                            <HiArrowRight />
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};

export default MenuCard;
