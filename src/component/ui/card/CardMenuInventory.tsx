// CardMenuInventory.tsx
import {IoIosSquare} from "react-icons/io";
import {useState} from "react";
import {formatCurrency} from "../../../utils";
import {MdUpdate} from "react-icons/md";

interface CardMenuInventoryProps {
    isAvailable: boolean;
    id: number;
    name: string;
    description: string;
    photo: string;
    price: number;
    rating: number;
    showModalUpdate: (id: number) => void;
}

const CardMenuInventory: React.FC<CardMenuInventoryProps> = ({
                                                                 id,
                                                                 showModalUpdate,
                                                                 isAvailable,
                                                                 photo,
                                                                 price,
                                                                 rating,
                                                                 name,
                                                                 description
                                                             }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={
                'py-4 border-y min-w-2xl grid grid-cols-5 items-start gap-4 ' +
                'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors'
            }
        >
            <div className={'flex gap-4'}>
                <img className={'w-12 h-12 rounded object-cover'} src={`${photo}`} alt={`${name}`}/>
                <div>
                    <h4 className={'xl:w-full text-wrap w-12 h-6 truncate text-gray-900 dark:text-gray-100'}>{name}</h4>
                    <p className={'text-gray-500 dark:text-gray-300'}>Review : {rating}</p>
                </div>
            </div>
            <div>
                <h4 className={'text-gray-900 dark:text-gray-100'}>Description</h4>
                <div>
                    <p className={`text-gray-500 dark:text-gray-300 w-56 ${open ? 'break-words' : 'truncate'}`}>
                        {description}
                    </p>
                    {description.length > 29 && (
                        <button
                            onClick={() => setOpen(!open)}
                            className={'text-blue-500 dark:text-blue-300 text-xs hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300'}
                        >
                            {open ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </div>
            </div>
            <div>
                <h4 className={'text-gray-900 dark:text-gray-100'}>Price</h4>
                <p className={'text-gray-500 dark:text-gray-300'}>{formatCurrency(price)}</p>
            </div>
            <div>
                <h4 className={'text-gray-900 dark:text-gray-100'}>Status</h4>
                <div className={'flex items-center gap-2'}>
                    {isAvailable ? (
                        <>
                            <span className={'text-lg text-green-500 dark:text-green-400'}><IoIosSquare/></span>
                            <p className={'text-gray-500 dark:text-gray-300'}>Available</p>
                        </>
                    ) : (
                        <>
                            <span className={'text-lg text-red-500 dark:text-red-400'}><IoIosSquare/></span>
                            <p className={'text-gray-500 dark:text-gray-300'}>Unavailable</p>
                        </>
                    )}
                </div>
            </div>
            <div>
                <h4 className={'text-center text-gray-900 dark:text-gray-100'}>Action</h4>
                <div className={'flex items-center justify-center gap-2'}>
                    <MdUpdate
                        onClick={() => {
                            showModalUpdate(id);
                        }}
                        className={'text-white bg-primary rounded-full text-3xl cursor-pointer'}/>
                </div>
            </div>
        </div>
    );
}

export default CardMenuInventory;