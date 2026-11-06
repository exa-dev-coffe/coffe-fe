import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAddMenuMutation } from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import {
  useIngredientsQuery,
  useSetRecipeMutation,
} from "@/features/inventory/hooks/useInventory.ts";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Input from "@/components/ui/Input.tsx";
import Textarea from "@/components/ui/Textarea.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import ImageUpload from "@/components/ui/ImageUpload.tsx";
import Checkbox from "@/components/ui/Checkbox.tsx";
import Button from "@/components/ui/Button.tsx";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCube,
} from "react-icons/hi";
import CategoryModal from "@/features/categories/components/CategoryModal.tsx";
import IngredientModal from "@/features/inventory/components/IngredientModal.tsx";
import type { CategoryItem } from "@/features/categories/types/category.types";
import type { Ingredient } from "@/features/inventory/types/inventory.types";

interface RecipeRowState {
  id: string;
  ingredient_id: string;
  quantity_required: number | string;
}

export const AddCatalogPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    mutateAsync: addMenu,
    isPending: loading,
    error: addError,
  } = useAddMenuMutation();
  const { data: categories = [] } = useCategoryOptionsQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();
  const { mutateAsync: setRecipe, isPending: savingRecipe } = useSetRecipeMutation();

  const optionsCategory: DropdownOption[] = categories.map(
    (c: CategoryItem) => ({
      value: Number(c.id),
      label: c.name,
    }),
  );

  const ingredientOptions: DropdownOption[] = rawIngredients.map((ing) => ({
    value: ing.id,
    label: `${ing.name} (${ing.unit})`,
  }));

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<DropdownOption | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  // Recipe (BOM) state
  const [recipeRows, setRecipeRows] = useState<RecipeRowState[]>([]);
  const [activeRowIdxForModal, setActiveRowIdxForModal] = useState<number | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setPrice("");
      return;
    }
    const formattedValue = new Intl.NumberFormat("id-ID").format(
      Number(rawValue),
    );
    setPrice(formattedValue);
  };

  const handleAddRecipeRow = () => {
    const defaultIngId = rawIngredients[0]?.id || "";
    setRecipeRows((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        ingredient_id: defaultIngId,
        quantity_required: 1,
      },
    ]);
  };

  const handleRemoveRecipeRow = (id: string) => {
    setRecipeRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleIngredientChange = (rowId: string, opt: DropdownOption | null) => {
    if (!opt) return;
    setRecipeRows((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, ingredient_id: String(opt.value) } : r
      )
    );
  };

  const handleQuantityChange = (rowId: string, val: string) => {
    setRecipeRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, quantity_required: val } : r))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdMenu = await addMenu({
        name,
        description,
        price: Number(String(price).replace(/\./g, "")),
        categoryId: selectedCategory?.value
          ? Number(selectedCategory.value)
          : undefined,
        photo,
        isAvailable,
      });

      // If recipe ingredients were defined, save BOM in inventory-app
      const validRecipe = recipeRows.filter(
        (r) => r.ingredient_id && Number(r.quantity_required) > 0
      );

      if (createdMenu?.id && validRecipe.length > 0) {
        await setRecipe({
          menuId: Number(createdMenu.id),
          items: validRecipe.map((r) => ({
            ingredient_id: r.ingredient_id,
            quantity_required: Number(r.quantity_required),
          })),
        });
      }

      navigate("/dashboard/manage-catalog");
    } catch {
      // Validation errors are handled globally or accessible via addError
    }
  };

  const errors = (addError as unknown as Record<string, string>) || {};

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Add New Catalog Item"
        subtitle="Create a new beverage or culinary offering for the coffee menu."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Catalog", to: "/dashboard/manage-catalog" },
          { label: "Add Item" },
        ]}
        action={
          <Link to="/dashboard/manage-catalog">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<HiOutlineArrowLeft />}
            >
              Back to Catalog
            </Button>
          </Link>
        }
      />

      <Card variant="dashboard">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Product Name"
              placeholder="e.g. Caramel Macchiato Roast"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Price (IDR)"
              type="text"
              placeholder="e.g. 35.000"
              value={price}
              onChange={handlePriceChange}
              error={errors.price}
              required
            />
          </div>

          <Dropdown
            label="Assign Category (Optional)"
            placeholder="Select category..."
            options={optionsCategory}
            value={selectedCategory}
            setValue={setSelectedCategory}
            footerAction={{
              label: (
                <>
                  <HiOutlinePlus className="text-sm" /> Add New Category
                </>
              ),
              onClick: () => setShowCategoryModal(true),
            }}
          />

          <Textarea
            label="Description & Flavor Profile"
            placeholder="Describe the bean origin, tasting notes, roast profile, or ingredients..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
          />

          {/* Recipe & Bill of Materials (BOM) Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HiOutlineCube className="text-amber-500" />
                  Recipe & Ingredients (BOM)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Specify raw materials required per serving for auto stock deduction.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<HiOutlinePlus />}
                onClick={handleAddRecipeRow}
              >
                Add Ingredient
              </Button>
            </div>

            {recipeRows.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No recipe ingredients added yet. Click &quot;Add Ingredient&quot; to link inventory raw materials to this item.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {recipeRows.map((row, idx) => {
                  const selectedIng = rawIngredients.find(
                    (i) => i.id === row.ingredient_id
                  );
                  const selectedDropdownOpt =
                    ingredientOptions.find((opt) => opt.value === row.ingredient_id) ||
                    null;

                  return (
                    <div
                      key={row.id}
                      className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-xs"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <Dropdown
                          label={idx === 0 ? "Ingredient" : undefined}
                          placeholder="Select raw material..."
                          options={ingredientOptions}
                          value={selectedDropdownOpt}
                          setValue={(opt) => handleIngredientChange(row.id, opt)}
                          size="sm"
                          footerAction={{
                            label: (
                              <>
                                <HiOutlinePlus className="text-sm" /> Add New Ingredient
                              </>
                            ),
                            onClick: () => {
                              setActiveRowIdxForModal(idx);
                              setShowIngredientModal(true);
                            },
                          }}
                        />
                      </div>

                      <div className="w-full sm:w-36 flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            label={idx === 0 ? "Qty Required" : undefined}
                            type="number"
                            min="0.001"
                            step="any"
                            value={row.quantity_required}
                            onChange={(e) => handleQuantityChange(row.id, e.target.value)}
                            required
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pb-2">
                          {selectedIng?.unit || "unit"}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveRecipeRow(row.id)}
                        className="self-end mb-1"
                        aria-label="Remove ingredient"
                      >
                        <HiOutlineTrash />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ImageUpload
            label="Product Photo"
            value={photo}
            onChange={setPhoto}
            required
          />

          <div className="pt-2">
            <Checkbox
              label="Set item as Available immediately in kitchen inventory"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <Link to="/dashboard/manage-catalog">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={loading || savingRecipe}
            >
              Publish Product
            </Button>
          </div>
        </form>
      </Card>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={(newCategory) => {
          setSelectedCategory({
            value: newCategory.id,
            label: newCategory.name,
          });
        }}
      />

      <IngredientModal
        isOpen={showIngredientModal}
        onClose={() => {
          setShowIngredientModal(false);
          setActiveRowIdxForModal(null);
        }}
        onSuccess={(newIng: Ingredient) => {
          if (activeRowIdxForModal !== null && recipeRows[activeRowIdxForModal]) {
            setRecipeRows((prev) =>
              prev.map((r, i) =>
                i === activeRowIdxForModal ? { ...r, ingredient_id: newIng.id } : r
              )
            );
          } else {
            setRecipeRows((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(7),
                ingredient_id: newIng.id,
                quantity_required: 1,
              },
            ]);
          }
        }}
      />
    </div>
  );
};

export default AddCatalogPage;
