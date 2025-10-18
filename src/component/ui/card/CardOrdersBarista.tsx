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
        'badge-danger rounded-lg',
        'badge-warn rounded-lg',
        'badge-primary rounded-lg'
    ]

    return (
        <div className={'py-4 border-y min-w-2xl border-gray-300 grid grid-cols-6 items-center gap-2 sm:gap-4'}>
            <div className={'space-y-4'}>
                <h4>
                    {
                        formatDateTime(createdAt)
                    }
                </h4>
                <p>
                    {
                        orderFor
                    }
                </p>
            </div>
            <div>
                <h4>Order By</h4>
                <p className={'text-sm text-gray-500'}>{
                    orderBy
                }</p>
            </div>
            <div>
                <h4>Table</h4>
                <p className={'text-sm text-gray-500'}>{
                    tableName
                }</p>
            </div>
            <div>
                <h4>Price</h4>
                <p className={'text-sm text-gray-500'}>{
                    formatCurrency(totalPrice)
                }</p>
            </div>
            <div className={'flex text-center items-center gap-4 min-w-36 flex-col'}>
                <h4>Status</h4>
                <span className={` ${statusClass[orderStatus]} `}>
                    {statusLabel[orderStatus]}
                </span>
            </div>
            <div className={'flex justify-center items-center'}>
                <Link to={`/dashboard-barista/manage-order/${id}`}>
                    <HiDotsHorizontal className={'bg-black text-white text-2xl rounded-full'}/>
                </Link>
            </div>
        </div>
    )
}

export default CardOrdersBarista;
