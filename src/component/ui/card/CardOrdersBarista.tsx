// CardOrdersBarista.tsx
import {formatCurrency, formatDateTime} from "../../../utils";
import {HiDotsHorizontal} from "react-icons/hi";
import {Link} from "react-router";

interface CardOrdersBaristaProps {
    createdAt: string
    orderFor: string
    orderBy: string
    tableName: string
    totalPrice: number
    orderStatus: number
    id: number
}

const CardOrdersBarista: React.FC<CardOrdersBaristaProps> = ({
                                                                 createdAt,
                                                                 orderFor,
                                                                 totalPrice,
                                                                 orderBy,
                                                                 tableName,
                                                                 orderStatus,
                                                                 id
                                                             }) => {

    const statusLabel = [
        'Order Confirmed',
        'Delivering Order',
        'Order Completed'
    ]

    const statusClass = [
        'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 px-3 py-1 rounded-lg',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-3 py-1 rounded-lg',
        'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100 px-3 py-1 rounded-lg'
    ]

    const label = statusLabel[orderStatus] ?? 'Unknown Status'
    const badgeClass = statusClass[orderStatus] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 px-3 py-1 rounded-lg'

    return (
        <div className={
            'py-4 border-y min-w-2xl grid grid-cols-6 items-center gap-2 sm:gap-4 ' +
            'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100'
        }>
            <div className={'space-y-4'}>
                <h4 className={'text-sm sm:text-base'}>
                    {formatDateTime(createdAt)}
                </h4>
                <p className={'text-sm text-gray-600 dark:text-gray-300'}>
                    {orderFor}
                </p>
            </div>
            <div>
                <h4 className={'text-sm font-medium'}>Order By</h4>
                <p className={'text-sm text-gray-500 dark:text-gray-300'}>
                    {orderBy}
                </p>
            </div>
            <div>
                <h4 className={'text-sm font-medium'}>Table</h4>
                <p className={'text-sm text-gray-500 dark:text-gray-300'}>
                    {tableName}
                </p>
            </div>
            <div>
                <h4 className={'text-sm font-medium'}>Price</h4>
                <p className={'text-sm text-gray-500 dark:text-gray-300'}>
                    {formatCurrency(totalPrice)}
                </p>
            </div>
            <div className={'flex text-center items-center gap-4 min-w-36 flex-col'}>
                <h4 className={'text-sm font-medium'}>Status</h4>
                <span className={badgeClass}>
                    {label}
                </span>
            </div>
            <div className={'flex justify-center items-center'}>
                <Link to={`/dashboard/manage-order/${id}`}>
                    <HiDotsHorizontal
                        className={'bg-black text-white dark:bg-white dark:text-black text-2xl rounded-full p-1'}/>
                </Link>
            </div>
        </div>
    )
}

export default CardOrdersBarista;