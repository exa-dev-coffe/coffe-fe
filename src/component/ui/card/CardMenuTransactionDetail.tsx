import {IoStarSharp} from "react-icons/io5";
import {formatCurrency} from "../../../utils";
import {useState} from "react";

interface CardMenuTransactionDetailProps {
    photo: string;
    menu_name: string;
    qty: number;
    notes: string;
    total_price: number;
    rating: number;
    id: number;
    handleSetRate: (rating: number, id: number) => void
}

const CardMenuTransactionDetail: React.FC<CardMenuTransactionDetailProps> = ({
                                                                                 menu_name,
                                                                                 qty,
                                                                                 total_price,
                                                                                 rating,
                                                                                 notes,
                                                                                 photo,
                                                                                 handleSetRate,
                                                                                 id
                                                                             }) => {

    const [previewHover, setPreviewHover] = useState<number>(0);

    return (
        <div className={'flex text-2xl h-full gap-6 items-start'}>
            <img src={`${import.meta.env.VITE_APP_IMAGE_URL}/${photo}`}
                 className={'w-64 h-64 object-cover rounded-xl'}
                 alt={menu_name}/>
            <p className={'truncate'}>
                {qty}
                x
            </p>
            <div className={'grow h-full block  flex-col'}>
                <div className={'grow h-full min-h-52'}>
                    <h5 className={'w-72 truncate font-bold '}>
                        {menu_name}
                    </h5>
                    <p className={' text-xl mt-2 text-wrap'}>
                        Notes&nbsp;:&nbsp;{notes}
                    </p>
                </div>
                <div className={'flex items-center gap-5 mt-5'}>
                    <h5>
                        Rate Menu
                    </h5>

                    <div
                        className={'mt-auto flex items-center text-2xl '}>
                        <div className={'flex items-center'}
                        >
                            {
                                Array.from({length: 5}).map((_, index: number) => {
                                    return (
                                        <button key={index}
                                                onMouseEnter={() => {
                                                    if (rating !== 0) return;
                                                    setPreviewHover(index + 1)
                                                }}
                                                disabled={rating !== 0}
                                                onMouseLeave={() => {
                                                    if (rating !== 0) return;
                                                    setPreviewHover(0)
                                                }}
                                                onClick={() => {
                                                    if (rating !== 0) return;
                                                    handleSetRate(index + 1, id)
                                                }}
                                                className={`disabled:cursor-not-allowed ${(rating || previewHover) > (index) ? 'text-yellow-400 hover:cursor-pointer' : 'text-gray-300'}`}>
                                            <IoStarSharp className={''}/>
                                        </button>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            <p>
                {formatCurrency(total_price || 0)}
            </p>
        </div>
    )
}

export default CardMenuTransactionDetail;