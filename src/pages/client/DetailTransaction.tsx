import {useEffect, useState} from "react";
import useOrder from "../../hook/useOrder.ts";
import type {Order} from "../../model/order.ts";
import {useParams} from "react-router";
import NotFoundPage from "../404.tsx";
import {formatCurrency, formatDateTimeShortString} from "../../utils";
import CardMenuTransactionDetail from "../../component/ui/card/CardMenuTransactionDetail.tsx";
import DetailTransactionSkeleton from "../../component/ui/Skeleton/DetailTransactionSkeleton.tsx";

const DetailTransactionPage = () => {

    const {getOrderById, loading, handleSetRate} = useOrder();
    const [data, setData] = useState<Order>({
        id: 0,
        orderFor: '',
        tableName: '',
        orderBy: '',
        totalPrice: 0,
        details: [],
        orderStatus: 0,
        tableId: 0,
        userId: 0,
        createdAt: ''
    });
    const params = useParams<Readonly<{ id: string }>>()
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {

            const res = await getOrderById(Number(params.id))
            if (res) {
                setData(res.data);
            } else {
                setNotFound(true);
            }

        }
        fetchData()
    }, []);

    if (notFound && !loading) {
        return <NotFoundPage/>
    }

    const handleSetRating = async (rating: number, id: number) => {
        const res = await handleSetRate(rating, id);
        if (res) {
            const updatedDetails = data.details.map((item) =>
                item.id === id ? {...item, rating} : item
            );
            setData((prevData) => ({
                ...prevData,
                details: updatedDetails,
            }));
        }
    }

    const statusLabel = [
        'Order Confirmed',
        'Delivering Order',
        'Order Completed'
    ]

    const statusClass = data.orderStatus === 1
        ? `text-[#F9A825] dark:text-[#F9A825]`
        : data.orderStatus === 3
            ? `text-[#47DC53] dark:text-[#47DC53]`
            : data.orderStatus === 2
                ? `text-[#DDE232] dark:text-[#DDE232]`
                : `text-gray-900 dark:text-gray-100`;

    return (
        <section className="container mx-auto my-10 px-4">
            <div className={'flex gap-5'}>
                <h4 className={'text-gray-900 dark:text-gray-100'}>
                    Menu
                </h4>
                <span className={'text-gray-600 dark:text-gray-400'}>
                    /
                </span>
                <h4 className={'text-gray-900 dark:text-gray-100'}>
                    Transactions
                </h4>
                <span className={'text-gray-600 dark:text-gray-400'}>
                    /
                </span>
                <h4 className={'font-bold text-gray-900 dark:text-gray-100'}>
                    Detail Orders
                </h4>
            </div>
            <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-3xl sm:text-5xl text-gray-900 dark:text-gray-100'}>
                    Transactions
                </h4>
            </div>
            {

                loading ? <DetailTransactionSkeleton/> :
                    <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl '}>
                        <h4 className={'font-bold text-3xl text-gray-900 dark:text-gray-100'}>
                            Detail Orders
                        </h4>
                        <div className={'flex mb-10 md:flex-row flex-col gap-5 justify-between items-start mt-7'}>
                            <div className={'space-y-4'}>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28 text-gray-700 dark:text-gray-300'}>
                                        Order For
                                    </h5>
                                    <span className={'text-gray-600 dark:text-gray-400'}>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={'text-gray-900 dark:text-gray-100'}>
                                        {data.orderFor}
                                    </p>
                                </div>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28 text-gray-700 dark:text-gray-300'}>
                                        Order Table
                                    </h5>
                                    <span className={'text-gray-600 dark:text-gray-400'}>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={'text-gray-900 dark:text-gray-100'}>
                                        {data.tableName}
                                    </p>
                                </div>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28 text-gray-700 dark:text-gray-300'}>
                                        Order Date
                                    </h5>
                                    <span className={'text-gray-600 dark:text-gray-400'}>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={'text-gray-900 dark:text-gray-100'}>
                                        {formatDateTimeShortString(data.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <h5 className={`text-sm sm:text-xl font-bold ${statusClass} mt-0`}>
                                {
                                    statusLabel[data.orderStatus]
                                }
                            </h5>
                        </div>
                        <div className={'space-y-10'}>
                            {
                                data.details.length > 0 &&
                                data.details.map((item, index) => (
                                    <CardMenuTransactionDetail handleSetRate={handleSetRating} {...item} key={index}/>
                                ))
                            }
                        </div>
                        <div
                            className={'flex font-bold text-xl sm:text-3xl mt-10 justify-between border-t border-gray-300 dark:border-gray-700 pt-5'}>
                            <h4 className={'text-gray-900 dark:text-gray-100'}>
                                Total
                            </h4>
                            <h4 className={'text-gray-900 dark:text-gray-100'}>
                                {formatCurrency(data.totalPrice)}
                            </h4>
                        </div>
                    </div>
            }
        </section>
    );
}

export default DetailTransactionPage;