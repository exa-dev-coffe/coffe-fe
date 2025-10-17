import {useState} from "react";
import CartContext, {type CartData} from "./CartContext.ts";

const CartProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [cart, setCart] = useState<CartData>({
        tableId: 0,
        tableName: '',
        orderFor: '',
        datas: [],
    });

    return (
        <CartContext.Provider value={{cart, setCart}}>
            {children}
        </CartContext.Provider>
    );
}

export default CartProvider;