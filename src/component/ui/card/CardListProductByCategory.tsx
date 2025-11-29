import React from "react";
import DummyProduct from "../../../assets/images/dummyProduct.png";

interface CardListProductByCategoryProps {
    name: string;
    description: string;
    image?: string;
}

const CardListProductByCategory: React.FC<CardListProductByCategoryProps> = ({
                                                                                 name,
                                                                                 description,
                                                                                 image = DummyProduct
                                                                             }) => {
    return (
        <div className={'flex gap-4 items-center text-slate-800 dark:text-slate-100'}>
            <img
                className={'w-14 h-14 rounded-sm bg-gray-100 dark:bg-slate-700 object-cover'}
                src={image}
                alt={name}
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DummyProduct;
                }}
            />
            <div>
                <h4 className={'text-lg font-semibold text-slate-800 dark:text-slate-100'}>{name}</h4>
                <p className={'text-sm max-w-40 truncate text-gray-500 dark:text-slate-400'}>
                    {description}
                </p>
            </div>
        </div>
    )
}

export default CardListProductByCategory;