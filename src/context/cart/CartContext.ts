import {createContext} from "react";

export type CartData = {
    tableId: number;
    tableName: string;
    orderFor: string;
    datas: {
        amount: number;
        id: number;
        nameProduct: string;
        price: number;
        photo: string;
        checked: boolean;
        notes: string;
    }[];
}

interface CartContext {
    cart: CartData;
    setCart: React.Dispatch<React.SetStateAction<CartData>>;
}

const AuthContext = createContext<CartContext | null>(null);

export default AuthContext;