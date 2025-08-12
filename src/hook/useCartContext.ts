import {useContext} from "react";
import CartContext from "../context/cart/CartContext.ts";

const useCartContext = () => {
    const cart = useContext(CartContext)
    if (!cart) {
        throw new Error("useCartContext must be used within a AuthProvider");
    }
    return cart;
}

export default useCartContext;