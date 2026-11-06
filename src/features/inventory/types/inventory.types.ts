export interface Ingredient {
  id: string;
  name: string;
  sku: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface IngredientFormData {
  name: string;
  sku: string;
  unit: string;
  current_stock?: number;
  min_stock_alert: number;
  cost_per_unit: number;
}

export interface RecipeItem {
  id: string;
  menu_id: number;
  ingredient_id: string;
  quantity_required: number;
  ingredient_name?: string;
  unit?: string;
  cost_per_unit?: number;
  subtotal_cost?: number;
}

export interface MenuCostSummary {
  menu_id: number;
  total_cogs: number;
  item_count: number;
}

export interface RecipePayloadItem {
  ingredient_id: string;
  quantity_required: number;
}

export interface StockAdjustmentData {
  ingredient_id: string;
  quantity: number;
  change_type: "IN_PURCHASE" | "OUT_WASTE" | "ADJUSTMENT_OPNAME";
  reference_id?: string;
  notes?: string;
}

export interface StockLogItem {
  id: string;
  ingredient_id: string;
  ingredient_name?: string;
  change_type: string;
  quantity: number;
  balance_after: number;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export interface OpnameItem {
  id: string;
  opname_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  unit?: string;
  system_stock: number;
  physical_stock: number | null;
  difference: number | null;
  unit_cost: number;
  loss_value: number;
  notes?: string | null;
}

export interface OpnameSession {
  id: string;
  session_date: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "CANCELLED";
  notes?: string | null;
  created_by?: string;
  approved_by?: string | null;
  created_at: string;
  items?: OpnameItem[];
}

export interface CreateOpnamePayload {
  notes?: string;
  ingredient_ids?: string[];
}

export interface PhysicalCountEntry {
  ingredient_id: string;
  physical_stock: number;
  notes?: string;
}
