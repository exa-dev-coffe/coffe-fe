export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  unit?: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
}

export interface PurchaseItemPayload {
  ingredient_id: string;
  quantity: number;
  unit_cost: number;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name?: string;
  order_date: string;
  expected_date?: string;
  total_amount: number;
  status: "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";
  payment_status: "UNPAID" | "PAID";
  notes?: string;
  created_at: string;
  items: PurchaseItem[];
}

export interface CreatePurchasePayload {
  supplier_id: string;
  expected_date?: string;
  notes?: string;
  items: PurchaseItemPayload[];
}

export type ExpenseCategory =
  | "RAW_MATERIAL"
  | "RENT"
  | "UTILITIES"
  | "SALARY"
  | "MAINTENANCE"
  | "MARKETING"
  | "LOGISTICS"
  | "OTHER";

export interface Expense {
  id: string;
  expense_date: string;
  category: ExpenseCategory;
  amount: number;
  payment_method: string;
  recipient: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

export interface CreateExpensePayload {
  expense_date?: string;
  category: ExpenseCategory;
  amount: number;
  payment_method: string;
  recipient: string;
  reference_number?: string;
  notes?: string;
}

export interface ExpenseCategorySummary {
  category: string;
  total_amount: number;
  count: number;
}

export interface FinancialSummary {
  from: string;
  to: string;
  total_revenue: number;
  cogs: number;
  gross_profit: number;
  gross_margin_percent: number;
  total_expenses: number;
  net_profit: number;
  net_margin_percent: number;
}

export interface MonthlyExpense {
  month: number;
  year: number;
  total_amount: number;
  category_breakdown: Record<string, number>;
}
