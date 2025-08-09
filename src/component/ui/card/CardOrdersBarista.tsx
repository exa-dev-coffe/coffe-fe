import {formatCurrency, formatDateTime} from "../../../utils";
import {HiDotsHorizontal} from "react-icons/hi";
import {Link} from "react-router";

interface CardOrdersBaristaProps {
    created_at: string
    order_for: string
    order_by: string
    order_table: string
    total_price: number
    status: number
    status_label: string
    id: number
}

const CardOrdersBarista: React.FC<CardOrdersBaristaProps> = ({
                                                                 created_at,
                                                                 order_for,
                                                                 total_price,
                                                                 order_by,
                                                                 order_table,
                                                                 status,
                                                                 status_label,
                                                                 id
                                                             }) => {
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-6 items-center gap-4'}>
            <div className={'space-y-4'}>
                <h4>
                    {
                        formatDateTime(created_at)
                    }
                </h4>
                <p>
                    {
                        order_for
                    }
                </p>
            </div>
            <div>
                <h4>Order By</h4>
                <p className={'text-sm text-gray-500'}>{
                    order_by
                }</p>
            </div>
            <div>
                <h4>Table</h4>
                <p className={'text-sm text-gray-500'}>{
                    order_table
                }</p>
            </div>
            <div>
                <h4>Price</h4>
                <p className={'text-sm text-gray-500'}>{
                    formatCurrency(total_price)
                }</p>
            </div>
            <div className={'flex items-center gap-4 flex-col'}>
                <h4>Status</h4>
                {
                    status === 1 ?
                        <span className={'badge-danger rounded-lg'}>
                            {status_label}
                        </span>
                        :
                        status === 2 ?
                            <span className={'badge-warn rounded-lg'}>
                                {status_label}
                            </span>
                            :
                            status === 3 ?
                                <span className={'badge-primary rounded-lg'}>
                                    {status_label}
                                </span>
                                :
                                null
                }
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
