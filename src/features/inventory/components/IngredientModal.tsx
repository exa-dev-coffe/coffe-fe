import React, { useState } from "react";
import Modal from "@/components/ui/Modal.tsx";
import Input from "@/components/ui/Input.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import Button from "@/components/ui/Button.tsx";
import { useCreateIngredientMutation } from "@/features/inventory/hooks/useInventory.ts";
import type { Ingredient } from "@/features/inventory/types/inventory.types.ts";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newIngredient: Ingredient) => void;
}

const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: "Coffee Beans", label: "Coffee Beans" },
  { value: "Dairy & Milk", label: "Dairy & Milk" },
  { value: "Syrups & Flavors", label: "Syrups & Flavors" },
  { value: "Tea & Powders", label: "Tea & Powders" },
  { value: "Packaging & Supplies", label: "Packaging & Supplies" },
  { value: "Other", label: "Other Raw Material" },
];

const UNIT_OPTIONS: DropdownOption[] = [
  { value: "g", label: "Grams (g)" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "L", label: "Liters (L)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "shot", label: "Espresso Shot" },
  { value: "pump", label: "Syrup Pump" },
];

export const IngredientModal: React.FC<IngredientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption | null>(
    CATEGORY_OPTIONS[0]
  );
  const [selectedUnit, setSelectedUnit] = useState<DropdownOption | null>(
    UNIT_OPTIONS[0]
  );
  const [currentStock, setCurrentStock] = useState<number | string>(100);
  const [minStockAlert, setMinStockAlert] = useState<number | string>(20);
  const [costPerUnit, setCostPerUnit] = useState<number | string>(500);

  const { mutateAsync: createIngredient, isPending } = useCreateIngredientMutation();

  const handleNameChange = (val: string) => {
    setName(val);
    if (!sku) {
      const generated = "ING-" + val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
      setSku(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await createIngredient({
        name: name.trim(),
        sku: sku.trim() || `ING-${Date.now().toString().slice(-6)}`,
        unit: String(selectedUnit?.value || "g"),
        current_stock: Number(currentStock) || 0,
        min_stock_alert: Number(minStockAlert) || 10,
        cost_per_unit: Number(costPerUnit) || 0,
      });

      setName("");
      setSku("");
      onClose();

      if (onSuccess && created) {
        onSuccess(created);
      }
    } catch {
      // Global toast notification handles errors
    }
  };

  return (
    <Modal
      show={isOpen}
      handleClose={onClose}
      title="Add New Raw Ingredient"
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Ingredient Name"
            placeholder="e.g. Vanilla Bean Syrup"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="SKU / Identifier"
            placeholder="e.g. ING-VAN-01"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            label="Category"
            placeholder="Select category..."
            options={CATEGORY_OPTIONS}
            value={selectedCategory}
            setValue={setSelectedCategory}
          />

          <Dropdown
            label="Measurement Unit"
            placeholder="Select unit..."
            options={UNIT_OPTIONS}
            value={selectedUnit}
            setValue={setSelectedUnit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Initial Stock"
            type="number"
            placeholder="e.g. 100"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            required
          />

          <Input
            label="Min Stock Alert"
            type="number"
            placeholder="e.g. 20"
            value={minStockAlert}
            onChange={(e) => setMinStockAlert(e.target.value)}
            required
          />

          <Input
            label="Cost Per Unit (IDR)"
            type="number"
            placeholder="e.g. 500"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isPending}>
            Save Ingredient
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IngredientModal;
