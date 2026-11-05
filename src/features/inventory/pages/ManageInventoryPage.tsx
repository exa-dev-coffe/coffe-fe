import React, { useMemo, useState } from "react";
import PageHeader from "@/components/shared/PageHeader.tsx";
import Card from "@/components/ui/Card.tsx";
import Button from "@/components/ui/Button.tsx";
import Badge from "@/components/ui/Badge.tsx";
import EmptyState from "@/components/ui/EmptyState.tsx";
import Skeleton from "@/components/ui/Skeleton.tsx";
import Modal from "@/components/ui/Modal.tsx";
import Dropdown, { type DropdownOption } from "@/components/ui/Dropdown.tsx";
import { formatCurrency, formatDateTime } from "@/core/utils/formatters.ts";
import {
  HiOutlineCube,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineAdjustments,
  HiOutlineClipboardCheck,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineSwitchHorizontal,
} from "react-icons/hi";
import usePermission from "@/features/auth/hooks/usePermission.ts";
import { useMenusQuery, useUpdateMenuAvailabilityMutation } from "@/features/menu/hooks/useMenu.ts";
import {
  useIngredientsQuery,
  useCreateIngredientMutation,
  useUpdateIngredientMutation,
  useDeleteIngredientMutation,
  useRecipeQuery,
  useSetRecipeMutation,
  useStockAdjustmentMutation,
  useStockLogsQuery,
  useOpnamesQuery,
  useOpnameDetailQuery,
  useCreateOpnameMutation,
  useSubmitOpnameCountsMutation,
  useApproveOpnameMutation,
} from "../hooks/useInventory.ts";
import type {
  Ingredient,
  IngredientFormData,
  StockAdjustmentData,
  RecipePayloadItem,
} from "../types/inventory.types.ts";

type InventoryTab = "ingredients" | "recipes" | "opname" | "logs" | "availability";

export const ManageInventoryPage: React.FC = () => {
  const { canEdit, canCreate, canDelete } = usePermission();
  const [activeTab, setActiveTab] = useState<InventoryTab>("ingredients");
  const [search, setSearch] = useState("");

  // Queries
  const { data: ingredients = [], isLoading: loadingIngredients } = useIngredientsQuery();
  const { data: menusResponse } = useMenusQuery(1, 100);
  const menus = menusResponse?.data || [];

  // Mutations
  const { mutateAsync: createIngredient, isPending: creatingIng } = useCreateIngredientMutation();
  const { mutateAsync: updateIngredient, isPending: updatingIng } = useUpdateIngredientMutation();
  const { mutateAsync: deleteIngredient } = useDeleteIngredientMutation();
  const { mutateAsync: adjustStock, isPending: adjustingStock } = useStockAdjustmentMutation();

  // Ingredient Modal States
  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingredientForm, setIngredientForm] = useState<IngredientFormData>({
    name: "",
    sku: "",
    unit: "g",
    current_stock: 0,
    min_stock_alert: 50,
    cost_per_unit: 0,
  });

  // Adjust Stock Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedIngredientForAdjust, setSelectedIngredientForAdjust] = useState<Ingredient | null>(null);
  const [adjustForm, setAdjustForm] = useState<StockAdjustmentData>({
    ingredient_id: "",
    quantity: 0,
    change_type: "IN_PURCHASE",
    notes: "",
  });

  // Recipes Tab State
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(menus[0]?.id || null);
  const { data: menuRecipe = [], isLoading: loadingRecipe } = useRecipeQuery(selectedMenuId);
  const { mutateAsync: setRecipe, isPending: savingRecipe } = useSetRecipeMutation();
  const [recipeDraft, setRecipeDraft] = useState<RecipePayloadItem[]>([]);
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);

  // Sync draft when recipe changes
  React.useEffect(() => {
    if (menuRecipe && Array.isArray(menuRecipe)) {
      setRecipeDraft(
        menuRecipe.map((r) => ({
          ingredient_id: r.ingredient_id,
          quantity_required: r.quantity_required,
        }))
      );
    }
  }, [menuRecipe]);

  // Opname Tab State
  const { data: opnameSessions = [], isLoading: loadingOpnames } = useOpnamesQuery();
  const [selectedOpnameId, setSelectedOpnameId] = useState<string | null>(null);
  const { data: activeOpnameDetail } = useOpnameDetailQuery(selectedOpnameId);
  const { mutateAsync: createOpname, isPending: creatingOpname } = useCreateOpnameMutation();
  const { mutateAsync: submitOpnameCounts, isPending: submittingCounts } = useSubmitOpnameCountsMutation();
  const { mutateAsync: approveOpname, isPending: approvingOpname } = useApproveOpnameMutation();
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});

  // Stock Movement Logs State
  const [logFilterType, setLogFilterType] = useState<string>("");
  const { data: stockLogs = [], isLoading: loadingLogs } = useStockLogsQuery(undefined, logFilterType || undefined);

  // Kitchen Menu Availability State (Legacy)
  const { mutateAsync: updateMenuAvailability } = useUpdateMenuAvailabilityMutation();
  const [availModal, setAvailModal] = useState<{ open: boolean; id: number | null; current: boolean }>({
    open: false,
    id: null,
    current: true,
  });

  // Filtered ingredients
  const filteredIngredients = ingredients.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const unitOptions: DropdownOption[] = useMemo(
    () => [
      { value: "g", label: "Gram (g)" },
      { value: "ml", label: "Milliliter (ml)" },
      { value: "pcs", label: "Pieces (pcs)" },
      { value: "kg", label: "Kilogram (kg)" },
      { value: "l", label: "Liter (L)" },
    ],
    []
  );

  const logFilterOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Events" },
      { value: "IN_PURCHASE", label: "IN_PURCHASE" },
      { value: "OUT_PRODUCTION", label: "OUT_PRODUCTION" },
      { value: "OUT_WASTE", label: "OUT_WASTE" },
      { value: "ADJUSTMENT_OPNAME", label: "ADJUSTMENT_OPNAME" },
    ],
    []
  );

  const adjustTypeOptions: DropdownOption[] = useMemo(
    () => [
      { value: "IN_PURCHASE", label: "IN_PURCHASE (Restock / Received)" },
      { value: "OUT_WASTE", label: "OUT_WASTE (Spilled / Damaged / Expired)" },
      { value: "ADJUSTMENT_OPNAME", label: "ADJUSTMENT_OPNAME (Physical Discrepancy)" },
    ],
    []
  );

  const ingredientDropdownOptions: DropdownOption[] = useMemo(
    () =>
      ingredients.map((ing) => ({
        value: ing.id,
        label: `${ing.name} (${ing.unit})`,
      })),
    [ingredients]
  );

  const handleOpenCreateIngredient = () => {
    setEditingIngredient(null);
    setIngredientForm({
      name: "",
      sku: `ING-${Math.floor(1000 + Math.random() * 9000)}`,
      unit: "g",
      current_stock: 0,
      min_stock_alert: 50,
      cost_per_unit: 0,
    });
    setIngredientModalOpen(true);
  };

  const handleOpenEditIngredient = (item: Ingredient) => {
    setEditingIngredient(item);
    setIngredientForm({
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      min_stock_alert: item.min_stock_alert,
      cost_per_unit: item.cost_per_unit,
    });
    setIngredientModalOpen(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIngredient) {
        await updateIngredient({ id: editingIngredient.id, data: ingredientForm });
      } else {
        await createIngredient(ingredientForm);
      }
      setIngredientModalOpen(false);
    } catch {
      // Handled by mutation onError
    }
  };

  const handleOpenAdjust = (item: Ingredient) => {
    setSelectedIngredientForAdjust(item);
    setAdjustForm({
      ingredient_id: item.id,
      quantity: 0,
      change_type: "IN_PURCHASE",
      notes: "",
    });
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientForAdjust) return;
    try {
      await adjustStock(adjustForm);
      setAdjustModalOpen(false);
    } catch {
      // Handled by mutation
    }
  };

  const handleAddRecipeIngredient = () => {
    if (ingredients.length === 0) return;
    setRecipeDraft((prev) => [
      ...prev,
      { ingredient_id: ingredients[0].id, quantity_required: 10 },
    ]);
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    setRecipeDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    if (!selectedMenuId) return;
    try {
      await setRecipe({ menuId: selectedMenuId, items: recipeDraft });
      setIsEditingRecipe(false);
    } catch {
      // Handled by mutation
    }
  };

  const handleStartOpname = async () => {
    try {
      const newSession = await createOpname({ notes: "Physical stock audit session" });
      if (newSession) {
        setSelectedOpnameId(newSession.id);
      }
    } catch {
      // Handled by mutation
    }
  };

  const handleSubmitCounts = async () => {
    if (!selectedOpnameId || !activeOpnameDetail) return;
    const items = (activeOpnameDetail.items || []).map((item: any) => ({
      ingredient_id: item.ingredient_id,
      physical_stock: physicalCounts[item.ingredient_id] ?? item.system_stock,
    }));
    await submitOpnameCounts({ opnameId: selectedOpnameId, items });
  };

  const handleApproveOpname = async () => {
    if (!selectedOpnameId) return;
    await approveOpname(selectedOpnameId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Recipe Management"
        subtitle="Manage raw ingredients, recipe Bill of Materials (BOM), physical stock opnames, and audit movement logs."
        breadcrumb={[
          { label: "Dashboard", to: "/dashboard/menu" },
          { label: "Inventory" },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ingredients")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "ingredients"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineCube className="text-base" />
          Raw Materials ({ingredients.length})
        </button>
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "recipes"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineDocumentText className="text-base" />
          Menu Recipes (BOM)
        </button>
        <button
          onClick={() => setActiveTab("opname")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "opname"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineClipboardCheck className="text-base" />
          Stock Opname
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineDocumentText className="text-base" />
          Movement Logs
        </button>
        <button
          onClick={() => setActiveTab("availability")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === "availability"
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HiOutlineSwitchHorizontal className="text-base" />
          Kitchen Menu Toggle
        </button>
      </div>

      {/* TAB 1: RAW INGREDIENTS */}
      {activeTab === "ingredients" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none" />
              <input
                type="text"
                placeholder="Search raw ingredients by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
              />
            </div>
            {canCreate("inventory") && (
              <Button
                variant="primary"
                onClick={handleOpenCreateIngredient}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <HiOutlinePlus className="text-base" />
                Add Raw Material
              </Button>
            )}
          </div>

          {loadingIngredients ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
          ) : !Array.isArray(filteredIngredients) || filteredIngredients.length === 0 ? (
            <EmptyState
              title="No raw ingredients found"
              description="Start registering raw materials like coffee beans, fresh milk, syrup, or cups."
              icon={<HiOutlineCube />}
            />
          ) : (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                    <tr>
                      <th className="px-5 py-3.5">Item Name & SKU</th>
                      <th className="px-5 py-3.5">Current Stock</th>
                      <th className="px-5 py-3.5">Unit Cost (COGS)</th>
                      <th className="px-5 py-3.5">Threshold</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
                    {filteredIngredients.map((item) => {
                      const isLowStock = item.current_stock <= item.min_stock_alert;
                      const isOutOfStock = item.current_stock <= 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-5 py-4 font-medium">
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                          </td>
                          <td className="px-5 py-4 font-semibold">
                            <span className="text-base font-black text-slate-900 dark:text-white">
                              {item.current_stock}
                            </span>{" "}
                            <span className="text-xs text-slate-400 uppercase font-medium">{item.unit}</span>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">
                            {formatCurrency(item.cost_per_unit)} / {item.unit}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            Min {item.min_stock_alert} {item.unit}
                          </td>
                          <td className="px-5 py-4">
                            {isOutOfStock ? (
                              <Badge variant="danger" dot>Out of Stock</Badge>
                            ) : isLowStock ? (
                              <Badge variant="warning" dot>Low Stock</Badge>
                            ) : (
                              <Badge variant="success" dot>In Stock</Badge>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canEdit("inventory") && (
                                <button
                                  onClick={() => handleOpenAdjust(item)}
                                  title="Quick Stock Adjustment"
                                  className="p-2 rounded-xl text-amber-600 hover:bg-amber-500/10 transition-colors"
                                >
                                  <HiOutlineAdjustments className="text-base" />
                                </button>
                              )}
                              {canEdit("inventory") && (
                                <button
                                  onClick={() => handleOpenEditIngredient(item)}
                                  title="Edit Ingredient"
                                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <HiOutlinePencil className="text-base" />
                                </button>
                              )}
                              {canDelete("inventory") && (
                                <button
                                  onClick={() => deleteIngredient(item.id)}
                                  title="Delete Ingredient"
                                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10 transition-colors"
                                >
                                  <HiOutlineTrash className="text-base" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: RECIPES / BOM */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Menu Item
            </h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {menus.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMenuId(m.id);
                    setIsEditingRecipe(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                    selectedMenuId === m.id
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-300 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-sm truncate">{m.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatCurrency(m.price)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Composition Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recipe Composition (Bill of Materials)
                </h3>
                <p className="text-xs text-slate-400">
                  Ingredients automatically deducted upon customer checkout for this menu item.
                </p>
              </div>
              {canEdit("inventory") && (
                <div>
                  {isEditingRecipe ? (
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setIsEditingRecipe(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSaveRecipe} loading={savingRecipe}>
                        Save Recipe
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => setIsEditingRecipe(true)}>
                      Edit Recipe
                    </Button>
                  )}
                </div>
              )}
            </div>

            {loadingRecipe ? (
              <Skeleton className="h-40 w-full rounded-2xl" />
            ) : recipeDraft.length === 0 ? (
              <EmptyState
                title="No recipe configured"
                description="This menu item does not have any raw ingredients mapped yet."
                icon={<HiOutlineDocumentText />}
                actionLabel={canEdit("inventory") ? "Configure BOM" : undefined}
                onAction={canEdit("inventory") ? () => setIsEditingRecipe(true) : undefined}
              />
            ) : (
              <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-5 py-3">Ingredient</th>
                        <th className="px-5 py-3">Portion Quantity</th>
                        <th className="px-5 py-3">Unit Cost</th>
                        <th className="px-5 py-3">Cost per Portion</th>
                        {isEditingRecipe && <th className="px-5 py-3 text-right">Remove</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {recipeDraft.map((item, idx) => {
                        const ing = ingredients.find((i) => i.id === item.ingredient_id);
                        const cost = (ing?.cost_per_unit || 0) * (item.quantity_required || 0);

                        return (
                          <tr key={idx}>
                            <td className="px-5 py-3 font-medium">
                              {isEditingRecipe ? (
                                <Dropdown
                                  size="sm"
                                  placeholder="Select ingredient..."
                                  options={ingredientDropdownOptions}
                                  value={
                                    ingredientDropdownOptions.find((ing) => ing.value === item.ingredient_id) || null
                                  }
                                  setValue={(opt) => {
                                    const val = opt?.value ? String(opt.value) : "";
                                    setRecipeDraft((prev) =>
                                      prev.map((r, i) => (i === idx ? { ...r, ingredient_id: val } : r))
                                    );
                                  }}
                                />
                              ) : (
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {ing?.name || "Unknown Ingredient"}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 font-semibold">
                              {isEditingRecipe ? (
                                <input
                                  type="number"
                                  step="any"
                                  value={item.quantity_required}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setRecipeDraft((prev) =>
                                      prev.map((r, i) => (i === idx ? { ...r, quantity_required: val } : r))
                                    );
                                  }}
                                  className="w-24 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                                />
                              ) : (
                                <span>
                                  {item.quantity_required} {ing?.unit}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-slate-500">
                              {formatCurrency(ing?.cost_per_unit || 0)} / {ing?.unit}
                            </td>
                            <td className="px-5 py-3 font-bold text-amber-600 dark:text-amber-400">
                              {formatCurrency(cost)}
                            </td>
                            {isEditingRecipe && (
                              <td className="px-5 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveRecipeIngredient(idx)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-500/10 rounded-lg"
                                >
                                  <HiOutlineTrash className="text-base" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {isEditingRecipe && (
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="secondary" size="sm" onClick={handleAddRecipeIngredient}>
                      <HiOutlinePlus className="text-base mr-1" /> Add Ingredient to Recipe
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK OPNAME */}
      {activeTab === "opname" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Physical Stock Audit</h3>
              <p className="text-xs text-slate-400">
                Audit and reconcile physical inventory against recorded database counts.
              </p>
            </div>
            {canCreate("inventory") && (
              <Button variant="primary" onClick={handleStartOpname} loading={creatingOpname}>
                <HiOutlinePlus className="text-base mr-1" /> Start New Opname Session
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Sessions</h4>
              {loadingOpnames ? (
                <Skeleton className="h-32 w-full rounded-2xl" />
              ) : !Array.isArray(opnameSessions) || opnameSessions.length === 0 ? (
                <EmptyState
                  title="No opname sessions"
                  description="Click Start New Opname to audit physical ingredients."
                  icon={<HiOutlineClipboardCheck />}
                />
              ) : (
                <div className="space-y-2">
                  {opnameSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedOpnameId(session.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        selectedOpnameId === session.id
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-300"
                          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{formatDateTime(session.created_at)}</span>
                        <Badge
                          variant={
                            session.status === "APPROVED"
                              ? "success"
                              : session.status === "SUBMITTED"
                              ? "warning"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{session.notes || "Stock audit"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Session Detail & Counts Form */}
            <div className="lg:col-span-2 space-y-4">
              {selectedOpnameId && activeOpnameDetail ? (
                <Card className="space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Session #{activeOpnameDetail.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-slate-400">Status: {activeOpnameDetail.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeOpnameDetail.status === "DRAFT" && canEdit("inventory") && (
                        <Button variant="primary" size="sm" onClick={handleSubmitCounts} loading={submittingCounts}>
                          Save Physical Counts
                        </Button>
                      )}
                      {activeOpnameDetail.status === "SUBMITTED" && canEdit("inventory") && (
                        <Button variant="primary" size="sm" onClick={handleApproveOpname} loading={approvingOpname}>
                          <HiOutlineCheckCircle className="text-base mr-1" /> Approve & Reconcile
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Counts Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2.5">Ingredient</th>
                          <th className="px-4 py-2.5">System Stock</th>
                          <th className="px-4 py-2.5">Physical Stock</th>
                          <th className="px-4 py-2.5">Difference</th>
                          <th className="px-4 py-2.5">Loss / Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {(activeOpnameDetail.items || []).map((item: any) => {
                          const diff = item.difference ?? 0;
                          const isLoss = diff < 0;

                          return (
                            <tr key={item.id}>
                              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                                {item.ingredient_name}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {item.system_stock} {item.unit}
                              </td>
                              <td className="px-4 py-3">
                                {activeOpnameDetail.status === "DRAFT" ? (
                                  <input
                                    type="number"
                                    step="any"
                                    defaultValue={item.physical_stock ?? item.system_stock}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setPhysicalCounts((prev) => ({
                                        ...prev,
                                        [item.ingredient_id]: val,
                                      }));
                                    }}
                                    className="w-24 px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                                  />
                                ) : (
                                  <span className="font-bold">
                                    {item.physical_stock ?? "-"} {item.unit}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-bold">
                                {diff === 0 ? (
                                  <span className="text-slate-400">0</span>
                                ) : (
                                  <span className={isLoss ? "text-rose-600" : "text-emerald-600"}>
                                    {diff > 0 ? `+${diff}` : diff} {item.unit}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-semibold text-rose-600">
                                {item.loss_value > 0 ? formatCurrency(item.loss_value) : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <EmptyState
                  title="No session selected"
                  description="Select a stock opname audit session from the left."
                  icon={<HiOutlineClipboardCheck />}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK MOVEMENT LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-64">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Filter Event:</span>
              <Dropdown
                size="sm"
                options={logFilterOptions}
                value={logFilterOptions.find((l) => l.value === logFilterType) || logFilterOptions[0]}
                setValue={(opt) => setLogFilterType(opt?.value ? String(opt.value) : "")}
              />
            </div>
          </div>

          {loadingLogs ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : !Array.isArray(stockLogs) || stockLogs.length === 0 ? (
            <EmptyState
              title="No movement logs recorded"
              description="Stock adjustments and production deductions will show up here."
              icon={<HiOutlineDocumentText />}
            />
          ) : (
            <Card className="overflow-hidden p-0 border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3">Timestamp</th>
                      <th className="px-5 py-3">Ingredient</th>
                      <th className="px-5 py-3">Event Type</th>
                      <th className="px-5 py-3">Quantity</th>
                      <th className="px-5 py-3">Balance After</th>
                      <th className="px-5 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {stockLogs.map((log) => {
                      const isPositive = log.quantity > 0;
                      return (
                        <tr key={log.id}>
                          <td className="px-5 py-3 text-slate-400 font-mono text-[11px]">
                            {formatDateTime(log.created_at)}
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">
                            {log.ingredient_name || log.ingredient_id}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              variant={
                                log.change_type === "IN_PURCHASE"
                                  ? "success"
                                  : log.change_type === "OUT_WASTE"
                                  ? "danger"
                                  : log.change_type === "OUT_PRODUCTION"
                                  ? "info"
                                  : "warning"
                              }
                              size="sm"
                            >
                              {log.change_type}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 font-black">
                            <span className={isPositive ? "text-emerald-600" : "text-rose-600"}>
                              {isPositive ? `+${log.quantity}` : log.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                            {log.balance_after}
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs">{log.notes || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: KITCHEN AVAILABILITY TOGGLER */}
      {activeTab === "availability" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Quickly turn off menu offerings when kitchen is temporarily overwhelmed or short on ingredients.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menus.map((m) => (
              <Card key={m.id} className="p-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{m.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{formatCurrency(m.price)}</div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                  <Badge variant={m.isAvailable ? "success" : "danger"} size="sm" dot>
                    {m.isAvailable ? "Available" : "Sold Out"}
                  </Badge>
                  {canEdit("inventory") && (
                    <Button
                      variant={m.isAvailable ? "danger" : "primary"}
                      size="sm"
                      onClick={() => setAvailModal({ open: true, id: m.id, current: m.isAvailable })}
                    >
                      {m.isAvailable ? "Mark Sold Out" : "Mark Available"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT INGREDIENT */}
      <Modal
        show={ingredientModalOpen}
        handleClose={() => setIngredientModalOpen(false)}
        title={editingIngredient ? "Edit Raw Ingredient" : "Add New Raw Material"}
      >
        <form onSubmit={handleSaveIngredient} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ingredient Name *
            </label>
            <input
              type="text"
              required
              value={ingredientForm.name}
              onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
              placeholder="e.g. Arabica Roast Beans, Fresh Milk, Paper Cup 8oz"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SKU *</label>
              <input
                type="text"
                required
                value={ingredientForm.sku}
                onChange={(e) => setIngredientForm({ ...ingredientForm, sku: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
            <div>
              <Dropdown
                label="Unit *"
                placeholder="Select unit..."
                options={unitOptions}
                value={unitOptions.find((u) => u.value === ingredientForm.unit) || unitOptions[0]}
                setValue={(opt) =>
                  setIngredientForm({ ...ingredientForm, unit: opt?.value ? String(opt.value) : "g" })
                }
                required
              />
            </div>
          </div>
          {!editingIngredient && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                step="any"
                value={ingredientForm.current_stock || 0}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, current_stock: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost per Unit (IDR) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={ingredientForm.cost_per_unit}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, cost_per_unit: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Low Stock Warning Alert *
              </label>
              <input
                type="number"
                step="any"
                required
                value={ingredientForm.min_stock_alert}
                onChange={(e) =>
                  setIngredientForm({ ...ingredientForm, min_stock_alert: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setIngredientModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creatingIng || updatingIng}>
              {editingIngredient ? "Update Ingredient" : "Create Ingredient"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: QUICK ADJUST STOCK */}
      <Modal
        show={adjustModalOpen}
        handleClose={() => setAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedIngredientForAdjust?.name || ""}`}
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <div>
            <Dropdown
              label="Adjustment Type *"
              placeholder="Select adjustment type..."
              options={adjustTypeOptions}
              value={adjustTypeOptions.find((a) => a.value === adjustForm.change_type) || adjustTypeOptions[0]}
              setValue={(opt) =>
                setAdjustForm({
                  ...adjustForm,
                  change_type: (opt?.value ? String(opt.value) : "IN_PURCHASE") as StockAdjustmentData["change_type"],
                })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity ({selectedIngredientForAdjust?.unit}) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={adjustForm.quantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Reason</label>
            <input
              type="text"
              value={adjustForm.notes || ""}
              onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
              placeholder="e.g. Milk carton dropped during morning rush"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3">
            <Button variant="secondary" type="button" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={adjustingStock}>
              Apply Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: AVAILABILITY CONFIRM */}
      <Modal
        show={availModal.open}
        handleClose={() => setAvailModal({ open: false, id: null, current: true })}
        title="Toggle Menu Availability"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to change the availability status of this item? Customers will{" "}
            {availModal.current ? "no longer see" : "now be able to order"} this product.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setAvailModal({ open: false, id: null, current: true })}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (availModal.id) {
                  await updateMenuAvailability({ id: availModal.id, isAvailable: !availModal.current });
                  setAvailModal({ open: false, id: null, current: true });
                }
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageInventoryPage;
