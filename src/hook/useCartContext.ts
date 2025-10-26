import {useContext} from "react";
import CartContext, {type CartData} from "../context/cart/CartContext.ts";
import Cookie from "../utils/cookie.ts";

const useCartContext = () => {
    const cart = useContext(CartContext)
    if (!cart) {
        throw new Error("useCartContext must be used within a AuthProvider");
    }

    const resetCart = () => {
        cart.setCart({
            tableId: 0,
            tableName: '',
            orderFor: '',
            datas: [],
        });
        Cookie.set("cart", JSON.stringify({
            tableId: 0,
            tableName: '',
            orderFor: '',
            datas: [],
        }), 1);
    }

    const setCart = ({tableId, tableName, orderFor, datas}: CartData) => {
        cart.setCart({
            tableId,
            tableName,
            orderFor,
            datas,
        });
        const dataCookie = {tableId, tableName, orderFor, datas};
        Cookie.set("cart", JSON.stringify(dataCookie), 1);
    }

    const setDatas = (datas: CartData['datas']) => {
        cart.setCart({
            ...cart.cart,
            datas: [...datas]
        })
        const dataCookie = {...cart.cart, datas};
        Cookie.set("cart", JSON.stringify(dataCookie), 1);
    }

    const setOrderFor = (orderFor: string) => {
        cart.setCart({
            ...cart.cart,
            orderFor: orderFor
        })
        const dataCookie = {...cart.cart, orderFor};
        Cookie.set("cart", JSON.stringify(dataCookie), 1);
    }

    const setTable = ({tableId, tableName}: { tableId: CartData['tableId'], tableName: CartData['tableName'] }) => {
        cart.setCart({
            ...cart.cart,
            tableId,
            tableName,
        })
        const dataCookie = {...cart.cart, tableId, tableName};
        Cookie.set("cart", JSON.stringify(dataCookie), 1);
    }
    return {
        ...cart.cart,
        setTable,
        setOrderFor,
        resetCart,
        setDatas,
        setCart,
    };
}

export default useCartContext;