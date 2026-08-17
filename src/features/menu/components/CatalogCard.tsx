import React from "react";
import {Link} from "react-router";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import {formatCurrency} from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import {HiOutlinePencilAlt, HiOutlineTrash, HiStar} from "react-icons/hi";

export interface CatalogCardProps {
    id: number;
    name: string;
    description: string;
    price: number;
    photo: string;
    rating?: number;
    isAvailable: boolean;
    onDelete: (id: number, photo: string) => void;
    onToggleAvailability: (id: number, isAvailable: boolean) => void;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({
    id,
    name,
    description,
    price,
    photo,
    rating,
    isAvailable,
    onDelete,
    onToggleAvailability,
}) => {
    return (
        <Card variant="interactive" padding="none" className="overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                    src={photo || DummyProduct}
                    alt={name}
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DummyProduct;
                    }}
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 flex gap-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleAvailability(id, !isAvailable);
                        }}
                        className="cursor-pointer"
                        title="Click to toggle availability"
                    >
                        <Badge variant={isAvailable ? "success" : "danger"} size="sm" dot>
                            {isAvailable ? "Available" : "Out of Stock"}
                        </Badge>
                    </button>
                </div>

                {rating !== undefined && rating > 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold flex items-center gap-1">
                        <HiStar />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                        {name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {description || "No description provided."}
                    </p>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400 pt-1">
                        {formatCurrency(price)}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">
                        ID #{id}
                    </span>
                    <div className="flex items-center gap-2">
                        <Link to={`/dashboard/manage-catalog/${id}`}>
                            <Button variant="secondary" size="sm" className="px-2.5" title="Edit Catalog Item">
                                <HiOutlinePencilAlt className="text-sm" />
                            </Button>
                        </Link>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(id, photo)}
                            className="px-2.5"
                            title="Delete Catalog Item"
                        >
                            <HiOutlineTrash className="text-sm" />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CatalogCard;
