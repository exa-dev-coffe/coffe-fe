import type { DiscountDetail } from "@/features/menu/types/menu.types.ts";

export interface PosCartItem {
  id: number;
  nameProduct: string;
  price: number;
  originalPrice?: number;
  discount?: DiscountDetail;
  photo?: string;
  amount: number;
  notes?: string;
}

export type OrderType = "DINE_IN" | "TAKEAWAY";
export type PaymentMethod = "CASH" | "MIDTRANS" | "WALLET";

export interface CreatePosOrderPayload {
  orderType: OrderType;
  tableId?: number;
  orderFor: string;
  paymentMethod: PaymentMethod;
  cashAmount?: number;
  cashChange?: number;
  walletPaymentCode?: string;
  voucherCode?: string;
  datas: {
    menuId: number;
    qty: number;
    notes?: string;
  }[];
}

export interface PosReceiptData {
  orderId: number;
  orderFor: string;
  orderType: OrderType;
  tableId?: number;
  tableName?: string;
  cashierName: string;
  createdAt: string;
  items: {
    menuId: number;
    name: string;
    price: number;
    qty: number;
    total: number;
    notes?: string;
  }[];
  subtotal: number;
  productDiscount: number;
  voucherCode?: string;
  voucherDiscount: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: string;
  cashAmount: number;
  cashChange: number;
  qrString?: string;
  qrUrl?: string;
}

export interface ChangePosPaymentPayload {
  orderId: number;
  paymentMethod: PaymentMethod;
  cashAmount?: number;
  cashChange?: number;
  walletPaymentCode?: string;
}
