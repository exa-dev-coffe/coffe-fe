import {formatCurrency, formatDateTimeShortString} from "../../../utils";
import {Link} from "react-router";

interface CardTransactionProps {
    id: number;
    orderStatus: number;
    maxItems: number;
    tableName: string;
    totalPrice: number;
    createdAt: string;
    details: {
        id: number;
        menuName: string;
        photo: string;
        price: number;
    }[];
}

const CardTransaction: React.FC<CardTransactionProps> = ({
                                                             details, maxItems,
                                                             id,
                                                             tableName,
                                                             orderStatus,
                                                             totalPrice,
                                                             createdAt
                                                         }) => {

    const statusLabel = [
        'Order Confirmed',
        'Delivering Order',
        'Order Completed'
    ]

    const statusClass = orderStatus === 0
        ? `text-[#F9A825] dark:text-[#F9A825]`
        : orderStatus === 2
            ? `text-[#47DC53] dark:text-[#47DC53]`
            : orderStatus === 1
                ? `text-[#DDE232] dark:text-[#DDE232]`
                : ``;

    return (
        <div data-aos={'fade-up'} className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl '}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-bold text-gray-900 dark:text-gray-100'}>
                    {tableName}
                </h4>
                <p className={'text-gray-600 dark:text-gray-300'}>
                    {formatDateTimeShortString(createdAt)}
                </p>
            </div>
            <div className={'flex justify-between my-7'}>
                <div className={'flex justify-start gap-10'}>
                    {
                        details.slice(0, maxItems).map((detail, detailIndex) => (
                            <div key={detailIndex}>
                                <img src={`${detail.photo}`}
                                     className={'xl:w-56 sm:w-44 xl:h-56 sm:h-44 w-28 h-28 object-cover rounded-xl'}
                                     alt={detail.menuName}/>
                                <h6 className={'text-sm sm:text-xl mt-4 w-28 xl:w-56 sm:w-44 truncate text-gray-700 dark:text-gray-100'}>
                                    {detail.menuName}
                                </h6>
                            </div>
                        ))
                    }
                </div>
                <div className={'text-end '}>
                    <h5 className={'font-bold text-base sm:text-2xl mt-7 mb-3 text-gray-900 dark:text-gray-100'}>
                        {formatCurrency(totalPrice)}
                    </h5>
                    <p className={'text-sm sm:text-xl mt-7 mb-3 text-gray-600 dark:text-gray-300'}>
                        {details.length} Menu
                    </p>
                </div>
            </div>
            <div className={'flex justify-between items-center border-t border-gray-300 dark:border-gray-700 '}>
                <h5 className={`text-sm sm:text-xl font-bold mt-7 mb-3 ${statusClass}`}>
                    {
                        statusLabel[orderStatus]
                    }
                </h5>
                <Link to={'/my-transaction/' + id}
                      className={'bg-gray-200 dark:bg-gray-700 px-5 py-2 rounded-lg transition-all duration-300 text-black dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'}>
                    Detail
                </Link>
            </div>
        </div>
    )
}

export default CardTransaction;