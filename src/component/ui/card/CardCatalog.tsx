import {IoIosSquare} from "react-icons/io";
import {HiPencilAlt} from "react-icons/hi";
import {BiSolidTrash} from "react-icons/bi";
import {useState} from "react";
import {Link} from "react-router";
import {formatCurrency} from "../../../utils";

interface CardCatalogProps {
    isAvailable: boolean;
    id: number;
    name: string;
    description: string;
    photo: string;
    price: number;
    rating: number;
    showModalDelete: (id: number) => void;
}

const CardCatalog: React.FC<CardCatalogProps> = ({
                                                     id,
                                                     showModalDelete,
                                                     isAvailable,
                                                     photo,
                                                     price,
                                                     rating,
                                                     name,
                                                     description
                                                 }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={'py-4 border-y border-gray-300 min-w-2xl grid grid-cols-5 items-start gap-4'}>
            <div className={'flex gap-4'}>
                <img className={'w-12 h-12'} src={`${photo}`} alt={`${name}`}/>
                <div>
                    <h4 className={'xl:w-full text-wrap w-12 h-6 truncate'}>
                        {name}
                    </h4>
                    <p className={'text-gray-500'}>Review : {
                        rating
                    }</p>
                </div>
            </div>
            <div>
                <h4>Description</h4>
                <div>

                    <p className={`text-gray-500 xl:w-48 ${open ? 'break-words' : 'truncate'}`}>
                        {
                            description
                        }
                    </p>
                    {
                        description.length > 29 && <button onClick={() => setOpen(!open)}
                                                           className={'text-blue-500 text-xs hover:text-blue-700 transition-all duration-300'}>
                            {open ? 'Show Less' : 'Show More'}
                        </button>
                    }
                </div>
            </div>
            <div>
                <h4>Price</h4>
                <p className={'text-gray-500'}>{formatCurrency(price)}</p>
            </div>
            <div>
                <h4>Status</h4>
                <div className={'flex items-center gap-2'}>
                    {
                        isAvailable ?
                            <>
                                <span className={'text-lg text-green-500'}><IoIosSquare/></span>
                                <p className={'text-gray-500'}>Available</p>
                            </>
                            :
                            <>
                                <span className={'text-lg text-red-500'}><IoIosSquare/></span>
                                <p className={'text-gray-500'}>Unavailable</p>
                            </>
                    }
                </div>
            </div>
            <div>
                <h4 className={'text-center'}>
                    Action
                </h4>
                <div className={'flex items-center justify-center gap-2'}>
                    <Link to={`${id}`}>
                        <HiPencilAlt className={'color-primary text-3xl'}/>
                    </Link>
                    <BiSolidTrash
                        onClick={() => {
                            showModalDelete(id);
                        }}
                        className={'text-red-500 text-3xl cursor-pointer'}/>
                </div>
            </div>
        </div>
    )
}

export default CardCatalog;