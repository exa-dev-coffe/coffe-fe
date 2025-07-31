import {IoIosSquare} from "react-icons/io";
import {HiPencilAlt} from "react-icons/hi";
import {BiSolidTrash} from "react-icons/bi";
import {useState} from "react";
import {Link} from "react-router";
import {formatCurrency} from "../../../utils";

interface CardCatalogProps {
    is_available: boolean;
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
                                                     is_available,
                                                     photo,
                                                     price,
                                                     rating,
                                                     name,
                                                     description
                                                 }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-5 items-start gap-4'}>
            <div className={'flex gap-4'}>
                <img className={'w-12'} src={`${import.meta.env.VITE_APP_IMAGE_URL}/${photo}`} alt={`${name}`}/>
                <div>
                    <h4>{name}</h4>
                    <p className={'text-gray-500'}>Rating : {
                        rating
                    }</p>
                </div>
            </div>
            <div>
                <h4>Description</h4>
                <div>

                    <p className={`text-gray-500 w-56 ${open ? 'break-words' : 'truncate'}`}>
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
                        is_available ?
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