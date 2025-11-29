import {useEffect, useState} from "react";
import DropDown from "../form/DropDown.tsx";

interface CardCatalogUncategorizedProps {
    id: number;
    name: string;
    description: string;
    photo: string;
    optionsDefault: {
        value: number;
        label: string;
    }[];
    handleUpdateCategory: (id: number, value: { value: number; label: string }) => void;
}

const CardCatalogUncategorized: React.FC<CardCatalogUncategorizedProps> = ({
                                                                               id,
                                                                               photo,
                                                                               optionsDefault,
                                                                               name,
                                                                               description,
                                                                               handleUpdateCategory
                                                                           }) => {
    const [selectedCategory, setSelectedCategory] = useState<{
        value: number;
        label: string;
    } | null>({value: 0, label: 'Uncategorized'});
    const [options, setOptions] = useState<{
        value: number;
        label: string;
    }[]>([]);

    const handleSetCategory = (value: {
        value: number;
        label: string;
    } | null) => {
        setSelectedCategory(value);
    }

    useEffect(() => {
        if (optionsDefault && optionsDefault.length > 0) {
            setOptions(optionsDefault);
        }
    }, [optionsDefault])

    return (
        <div
            className={'py-4 border-y min-w-2xl border-gray-300 dark:border-slate-700 grid grid-cols-3 items-start gap-4 bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100'}>
            <div className={'flex gap-4'}>
                <img
                    className={'w-12 h-12 rounded-sm bg-gray-100 dark:bg-slate-700 object-cover'}
                    src={`${photo}`}
                    alt={`${name}`}
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                />
                <div>
                    <h4 className={'text-slate-800 dark:text-slate-100'}>{name}</h4>
                    <p className={'text-sm max-w-40 truncate text-gray-500 dark:text-slate-400'}>{description}</p>
                </div>
            </div>
            <div>
                <DropDown
                    options={options}
                    setOptions={setOptions}
                    setValue={handleSetCategory}
                    value={selectedCategory}
                    placeholder={'Select Category'}
                    name={'category'}
                />
            </div>
            <div className={'flex justify-center items-center'}>
                <button
                    onClick={() => {
                        if (!selectedCategory || selectedCategory.value === 0) {
                            return;
                        }
                        handleUpdateCategory(id, selectedCategory)
                    }}
                    className={'btn-primary text-white px-10 font-semibold py-2 rounded-lg'}>
                    Set Category
                </button>
            </div>
        </div>
    )
}

export default CardCatalogUncategorized;