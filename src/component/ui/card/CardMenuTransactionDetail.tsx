import {IoStarSharp} from "react-icons/io5";
import {formatCurrency} from "../../../utils";
import {useState} from "react";

interface CardMenuTransactionDetailProps {
    photo: string;
    menuName: string;
    qty: number;
    notes: string;
    totalPrice: number;
    rating: number;
    id: number;
    handleSetRate: (rating: number, id: number) => void
}

const CardMenuTransactionDetail: React.FC<CardMenuTransactionDetailProps> = ({
                                                                                 menuName,
                                                                                 qty,
                                                                                 totalPrice,
                                                                                 rating,
                                                                                 notes,
                                                                                 photo,
                                                                                 handleSetRate,
                                                                                 id
                                                                             }) => {

    const [previewHover, setPreviewHover] = useState<number>(0);

    return (
        <div data-aos={'fade-up'}
             className={'flex md:flex-row flex-col text-base sm:text-2xl h-full gap-6 items-start'}>
            <img src={`${photo}`}
                 className={'w-44  md:w-64 h-44  md:h-64 object-cover rounded-xl'}
                 alt={menuName}/>
            <p className={''}>
                {qty}
                x
            </p>
            <div className={'md:grow h-full block  flex-col'}>
                <div className={'grow h-full min-h-32 md:min-h-52'}>
                    <h5 className={'w-52 truncate font-bold '}>
                        {menuName}
                    </h5>
                    <p className={' text-sm sm:text-xl mt-2 text-wrap'}>
                        Notes&nbsp;:&nbsp;{notes || '-'}
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
                                                    if (rating) return;
                                                    setPreviewHover(index + 1)
                                                }}
                                                disabled={!!rating}
                                                onMouseLeave={() => {
                                                    if (rating) return;
                                                    setPreviewHover(0)
                                                }}
                                                onClick={() => {
                                                    if (rating) return;
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
                {formatCurrency(totalPrice || 0)}
            </p>
        </div>
    )
}

export default CardMenuTransactionDetail;