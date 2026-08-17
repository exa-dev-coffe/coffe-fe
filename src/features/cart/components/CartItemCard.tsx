import React from "react";
import Card from "@/components/ui/Card.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {HiMinus, HiPlus, HiOutlineTrash} from "react-icons/hi";

export interface CartItemCardProps {
    id: number;
    name: string;
    price: number;
    photo: string;
    amount: number;
    checked: boolean;
    notes?: string;
    onToggleChecked: (id: number) => void;
    onUpdateQuantity: (id: number, qty: number) => void;
    onUpdateNotes: (id: number, notes: string) => void;
    onRemove: (id: number) => void;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
    id,
    name,
    price,
    photo,
    amount,
    checked,
    notes = "",
    onToggleChecked,
    onUpdateQuantity,
    onUpdateNotes,
    onRemove,
}) => {
    return (
        <Card variant="default" className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Checkbox and Product Details */}
                <div className="flex items-center gap-4 min-w-0">
                    <Checkbox
                        checked={checked}
                        onChange={() => onToggleChecked(id)}
                        aria-label={`Select ${name}`}
                    />

                    <img
                        src={photo || DummyProduct}
                        alt={name}
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DummyProduct;
                        }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0"
                    />

                    <div className="min-w-0 space-y-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                            {name}
                        </h4>
                        <p className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">
                            {formatCurrency(price)}
                        </p>
                    </div>
                </div>

                {/* Stepper and Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            disabled={amount <= 1}
                            onClick={() => onUpdateQuantity(id, Math.max(1, amount - 1))}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs disabled:opacity-30 cursor-pointer"
                            aria-label="Decrease quantity"
                        >
                            <HiMinus className="text-xs" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-slate-100">
                            {amount}
                        </span>
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(id, amount + 1)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-xs cursor-pointer"
                            aria-label="Increase quantity"
                        >
                            <HiPlus className="text-xs" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemove(id)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                        aria-label="Remove item from cart"
                        title="Remove item"
                    >
                        <HiOutlineTrash className="text-lg" />
                    </button>
                </div>
            </div>

            {/* Item Notes Input */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <input
                    type="text"
                    placeholder="Add special notes for barista (e.g. less ice, extra shot)..."
                    value={notes}
                    onChange={(e) => onUpdateNotes(id, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus-ring"
                />
            </div>
        </Card>
    );
};

export default CartItemCard;
