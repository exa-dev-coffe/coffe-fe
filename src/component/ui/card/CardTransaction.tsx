import {formatCurrency, formatDateTimeShortString} from "../../../utils";
import {Link} from "react-router";

interface CardTransactionProps {
    id: number;
    status: number;
    status_label: string;
    order_for: string;
    order_by: string;
    user_id: number;
    maxItems: number;
    order_table: string;
    table_id: number;
    total_price: number;
    created_at: string;
    details: {
        id: number;
        menu_id: number;
        menu_name: string;
        photo: string;
        qty: number;
        price: number;
        total_price: number;
        notes: string;
        rating: number;
    }[];
}

const CardTransaction: React.FC<CardTransactionProps> = ({
                                                             details, maxItems,
                                                             id,
                                                             order_table,
                                                             status_label,
                                                             status,
                                                             total_price,
                                                             created_at
                                                         }) => {


    return (
        <div data-aos={'fade-up'} className={'mt-10 bg-white p-8 rounded-2xl '}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-bold'}>
                    {order_table}
                </h4>
                <p>
                    {formatDateTimeShortString(created_at)}
                </p>
            </div>
            <div className={'flex justify-between my-7'}>
                <div className={'flex justify-start gap-10'}>
                    {
                        details.slice(0, maxItems).map((detail, detailIndex) => (
                            <div key={detailIndex}>
                                <img src={`${import.meta.env.VITE_APP_IMAGE_URL}/${detail.photo}`}
                                     className={'xl:w-56 sm:w-44 xl:h-56 sm:h-44 w-28 h-28 object-cover rounded-xl'}
                                     alt={detail.menu_name}/>
                                <h6 className={'text-sm sm:text-xl mt-4   w-28  xl:w-56 sm:w-44 truncate'}>
                                    {detail.menu_name}
                                </h6>
                            </div>
                        ))
                    }
                </div>
                <div className={'text-end '}>

                    <h5 className={'font-bold text-base sm:text-2xl mt-7 mb-3'}>
                        {formatCurrency(total_price)}
                    </h5>
                    <p className={' text-sm sm:text-xl mt-7 mb-3'}>
                        {details.length} Menu
                    </p>
                </div>
            </div>
            <div className={'flex justify-between items-center border-t border-gray-300 '}>
                <h5 className={`text-sm sm:text-xl font-bold mt-7 mb-3 ${status === 1 ? `text-[#F9A825]` : status === 3 ? `text-[#47DC53]` : status === 2 ? `text-[#DDE232]` : ``} `}>
                    {
                        status_label
                    }
                </h5>
                <Link to={'/my-transaction/' + id}
                      className={'bg-gray-200 px-5 py-2 rounded-lg transition-all duration-300 text-black hover:bg-gray-300'}>
                    Detail
                </Link>
            </div>
        </div>
    )
}

export default CardTransaction;