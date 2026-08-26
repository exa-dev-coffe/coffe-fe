import React, {useState, useCallback, useEffect, useMemo} from "react";
import CartContext, {type CartData, type CartItem} from "@/app/providers/CartContext.ts";
import Cookie from "@/core/utils/cookie.ts";

const initialCart: CartData = {
    tableId: 0,
    tableName: "",
    orderFor: "",
    datas: [],
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [cart, setCartState] = useState<CartData>(() => {
        const saved = Cookie.get("cart");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return initialCart;
            }
        }
        return initialCart;
    });

    const persistCart = useCallback((data: CartData) => {
        setCartState(data);
        Cookie.set("cart", JSON.stringify(data), 7);
    }, []);

    const setCart = useCallback((data: CartData) => {
        persistCart(data);
    }, [persistCart]);

    const setDatas = useCallback((datas: CartItem[]) => {
        setCartState((prev) => {
            const next = {...prev, datas};
            Cookie.set("cart", JSON.stringify(next), 7);
            return next;
        });
    }, []);

    const setOrderFor = useCallback((orderFor: string) => {
        setCartState((prev) => {
            const next = {...prev, orderFor};
            Cookie.set("cart", JSON.stringify(next), 7);
            return next;
        });
    }, []);

    const setTable = useCallback(({tableId, tableName}: { tableId: number; tableName: string }) => {
        setCartState((prev) => {
            const next = {...prev, tableId, tableName};
            Cookie.set("cart", JSON.stringify(next), 7);
            return next;
        });
    }, []);

    const resetCart = useCallback(() => {
        persistCart(initialCart);
    }, [persistCart]);

    const totalItemsCount = useMemo(() => {
        return cart.datas.reduce((sum, item) => sum + item.amount, 0);
    }, [cart.datas]);

    const checkedTotalPrice = useMemo(() => {
        return cart.datas
            .filter((item) => item.checked)
            .reduce((sum, item) => sum + item.price * item.amount, 0);
    }, [cart.datas]);

    // Synchronize initial cookie read
    useEffect(() => {
        const saved = Cookie.get("cart");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCartState(parsed);
            } catch {
                // ignore
            }
        }
    }, []);

    return (
        <CartContext.Provider
            value={{
                cart,
                setCart,
                setDatas,
                setOrderFor,
                setTable,
                resetCart,
                totalItemsCount,
                checkedTotalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;
