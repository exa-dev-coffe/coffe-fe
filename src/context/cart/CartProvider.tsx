import {useState} from "react";
import CartContext, {type CartData} from "./CartContext.ts";

const CartProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [cart, setCart] = useState<CartData>({
        table_id: 0,
        table_name: '',
        order_for: '',
        datas: [],
    });

    return (
        <CartContext.Provider value={{cart, setCart}}>
            {children}
        </CartContext.Provider>
    );
}

export default CartProvider;