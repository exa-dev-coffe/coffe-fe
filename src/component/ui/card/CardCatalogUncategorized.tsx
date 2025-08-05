import {useState} from "react";
import DropDown from "../form/DropDown.tsx";

interface CardCatalogUncategorizedProps {
    id: number;
    name: string;
    description: string;
    photo: string;
}

const CardCatalogUncategorized: React.FC<CardCatalogUncategorizedProps> = ({
                                                                               id,
                                                                               photo,
                                                                               name,
                                                                               description
                                                                           }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-3 items-start gap-4'}>
            <div className={'flex gap-4'}>
                <img className={'w-12'} src={`${photo}`} alt={`${name}`}/>
                <div>
                    <h4>{name}</h4>
                    <p className={'text-sm max-w-40 truncate text-gray-500'}>{description}</p>
                </div>
            </div>
            <div>
                <DropDown
                    options={[
                        {value: 1, label: 'Category 1'},
                        {value: 2, label: 'Category 2'},
                        {value: 3, label: 'Category 3'},
                        {value: 4, label: 'Category 4'},
                    ]}
                    placeholder={'Select Category'}
                    name={'category'}
                />
            </div>
            <div className={'flex justify-center items-center'}>
                <button
                    className={'btn-primary text-white px-10 font-semibold py-2 rounded-lg'}>
                    Set Category
                </button>
            </div>
        </div>
    )
}

export default CardCatalogUncategorized;