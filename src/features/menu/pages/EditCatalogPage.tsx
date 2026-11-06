import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  useMenuDetailQuery,
  useUpdateMenuMutation,
} from "@/features/menu/hooks/useMenu.ts";
import { useCategoryOptionsQuery } from "@/features/categories/hooks/useCategory.ts";
import {
  useIngredientsQuery,
  useRecipeQuery,
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
import Skeleton from "@/components/ui/Skeleton.tsx";
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCube,
} from "react-icons/hi";
import type { CategoryItem } from "@/features/categories/types/category.types";
import type { Ingredient } from "@/features/inventory/types/inventory.types";
import CategoryModal from "@/features/categories/components/CategoryModal.tsx";
import IngredientModal from "@/features/inventory/components/IngredientModal.tsx";

interface RecipeRowState {
  id: string;
  ingredient_id: string;
  quantity_required: number | string;
}

export const EditCatalogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const menuId = Number(id);
  const { data: menuData, isLoading: queryLoading } = useMenuDetailQuery(menuId);
  const {
    mutateAsync: updateMenu,
    isPending: updateLoading,
    error: updateError,
  } = useUpdateMenuMutation();
  const { data: categories = [] } = useCategoryOptionsQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();
  const { data: existingRecipe = [], isLoading: recipeLoading } = useRecipeQuery(menuId);
  const { mutateAsync: setRecipe, isPending: savingRecipe } = useSetRecipeMutation();

  const optionsCategory: DropdownOption[] = categories.map(
    (c: CategoryItem) => ({ value: Number(c.id), label: c.name }),
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
  const [photo, setPhoto] = useState<File | string | null>(null);
  const [photoBefore, setPhotoBefore] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Recipe (BOM) state
  const [recipeRows, setRecipeRows] = useState<RecipeRowState[]>([]);
  const [recipeInitialized, setRecipeInitialized] = useState(false);
  const [activeRowIdxForModal, setActiveRowIdxForModal] = useState<number | null>(null);

  useEffect(() => {
    if (menuData && !isInitialized) {
      setName(menuData.name);
      setDescription(menuData.description);
      setPrice(
        menuData.price
          ? new Intl.NumberFormat("id-ID").format(Number(menuData.price))
          : "",
      );
      setPhoto(menuData.photo);
      setPhotoBefore(menuData.photo);
      setIsAvailable(menuData.isAvailable);
      if (menuData.categoryId) {
        const cat = categories.find(
          (c: CategoryItem) => c.id === menuData.categoryId,
        );
        setSelectedCategory({
          value: Number(menuData.categoryId),
          label:
            cat?.name ||
            menuData.categoryName ||
            `Category #${menuData.categoryId}`,
        });
      }
      setIsInitialized(true);
    }
  }, [menuData, categories, isInitialized]);

  // Sync existing recipe from backend once loaded
  useEffect(() => {
    if (existingRecipe && !recipeInitialized) {
      if (Array.isArray(existingRecipe) && existingRecipe.length > 0) {
        setRecipeRows(
          existingRecipe.map((item) => ({
            id: item.id || Math.random().toString(36).substring(7),
            ingredient_id: item.ingredient_id,
            quantity_required: item.quantity_required,
          }))
        );
      }
      setRecipeInitialized(true);
    }
  }, [existingRecipe, recipeInitialized]);

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
    if (!id) return;
    try {
      await updateMenu({
        id: menuId,
        name,
        description,
        price: Number(String(price).replace(/\./g, "")),
        categoryId: selectedCategory?.value
          ? Number(selectedCategory.value)
          : undefined,
        photo,
        photoBefore,
        isAvailable,
      });

      // Save updated recipe in inventory-app
      const validRecipe = recipeRows.filter(
        (r) => r.ingredient_id && Number(r.quantity_required) > 0
      );

      await setRecipe({
        menuId,
        items: validRecipe.map((r) => ({
          ingredient_id: r.ingredient_id,
          quantity_required: Number(r.quantity_required),
        })),
      });

      navigate("/dashboard/manage-catalog");
    } catch {
      // Validation errors are handled via updateError or globally
    }
  };

  const errors = (updateError as unknown as Record<string, string>) || {};

  if (queryLoading && !menuData) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton variant="rounded" height={60} />
        <Skeleton variant="rounded" height={400} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Edit Catalog Item #${id}`}
        subtitle="Modify product information, pricing, tasting notes, and image."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Catalog", to: "/dashboard/manage-catalog" },
          { label: `Edit Item #${id}` },
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <Input
              label="Price (IDR)"
              type="text"
              value={price}
              onChange={handlePriceChange}
              error={errors.price}
              required
            />
          </div>

          <Dropdown
            label="Assign Category"
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
                  Raw materials consumed per serving. Automatically deducted upon POS orders.
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

            {recipeLoading && !recipeInitialized ? (
              <div className="space-y-2 py-2">
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </div>
            ) : recipeRows.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No recipe ingredients linked to this menu yet. Click &quot;Add Ingredient&quot; to configure.
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
          />

          <div className="pt-2">
            <Checkbox
              label="Item is Available in kitchen inventory"
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
              loading={updateLoading || savingRecipe}
            >
              Save Changes
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

export default EditCatalogPage;
