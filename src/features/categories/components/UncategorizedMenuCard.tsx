import React, { useState } from "react";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import { formatCurrency } from "@/core/utils/formatters.ts";
import DummyProduct from "@/assets/images/dummyProduct.png";
import usePermission from "@/features/auth/hooks/usePermission.ts";

export interface UncategorizedMenuCardProps {
  id: number;
  name: string;
  description: string;
  price: number;
  photo: string;
  optionsCategory: DropdownOption[];
  onAssignCategory: (menuId: number, categoryId: number) => Promise<boolean>;
}

export const UncategorizedMenuCard: React.FC<UncategorizedMenuCardProps> = ({
  id,
  name,
  description,
  price,
  photo,
  optionsCategory,
  onAssignCategory,
}) => {
  const { canEdit } = usePermission();
  const [selectedCategory, setSelectedCategory] =
    useState<DropdownOption | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    await onAssignCategory(id, selectedCategory.value);
    setSaving(false);
  };

  const allowEditCategory = canEdit("category");

  return (
    <Card
      variant="default"
      className="p-5 flex flex-col justify-between space-y-4"
    >
      <div className="flex gap-4 items-start">
        <img
          src={photo || DummyProduct}
          alt={name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = DummyProduct;
          }}
          className="w-20 h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
        />
        <div className="min-w-0 space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {description || "No description provided."}
          </p>
          <p className="text-xs font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(price)}
          </p>
        </div>
      </div>

      {allowEditCategory && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <Dropdown
            placeholder="Select Category..."
            options={optionsCategory}
            value={selectedCategory}
            setValue={setSelectedCategory}
          />
          <Button
            variant="primary"
            size="sm"
            fullWidth
            disabled={!selectedCategory || saving}
            loading={saving}
            onClick={handleAssign}
          >
            Assign Category
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UncategorizedMenuCard;
