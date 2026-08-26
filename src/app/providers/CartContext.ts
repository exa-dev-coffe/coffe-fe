import {createContext, useContext} from "react";

export interface CartItem {
    id: number;
    nameProduct: string;
    price: number;
    originalPrice?: number;
    discount?: {
        promotionId?: number;
        promotionName?: string;
        discountType?: string;
        discountValue?: number;
        savings?: number;
    } | null;
    photo: string;
    amount: number;
    checked: boolean;
    notes: string;
}

export interface CartData {
    tableId: number;
    tableName: string;
    orderFor: string;
    datas: CartItem[];
}

export interface CartContextType {
    cart: CartData;
    setCart: (data: CartData) => void;
    setDatas: (datas: CartItem[]) => void;
    setOrderFor: (orderFor: string) => void;
    setTable: (table: { tableId: number; tableName: string }) => void;
    resetCart: () => void;
    totalItemsCount: number;
    checkedTotalPrice: number;
}

export const CartContext = createContext<CartContextType | null>(null);

export const useCartContext = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext must be used within a CartProvider");
    }
    return context;
};

export default CartContext;
