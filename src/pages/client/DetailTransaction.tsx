import {useEffect, useState} from "react";
import useOrder from "../../hook/useOrder.ts";
import type {Order} from "../../model/order.ts";
import {useParams} from "react-router";
import NotFoundPage from "../404.tsx";
import {formatCurrency, formatDateTimeShortString} from "../../utils";
import CardMenuTransactionDetail from "../../component/ui/card/CardMenuTransactionDetail.tsx";
import DetailTransactionSkeleton from "../../component/ui/Skeleton/DetailTransactionSkeleton.tsx";

const DetailTransactionPage = () => {

    const {getOrder, loading, handleSetRate} = useOrder();
    const [data, setData] = useState<Order>({
        id: 0,
        order_for: '',
        order_table: '',
        total_price: 0,
        status: 0,
        status_label: '',
        order_by: '',
        details: [],
        table_id: 0,
        user_id: 0,
        created_at: ''
    });
    const params = useParams<Readonly<{ id: string }>>()
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {

            const res = await getOrder(true, Number(params.id))
            if (res) {
                setData(res as Order);
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


    return (
        <section className="container mx-auto my-10 px-4">
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4>
                    Transactions
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Detail Orders
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-3xl sm:text-5xl'}>
                    Transactions
                </h4>
            </div>
            {

                loading ? <DetailTransactionSkeleton/> :
                    <div className={'mt-10 bg-white p-8 rounded-2xl '}>
                        <h4 className={'font-bold text-3xl'}>
                            Detail Orders
                        </h4>
                        <div className={'flex mb-10 md:flex-row flex-col gap-5 justify-between items-start mt-7'}>
                            <div className={'space-y-4'}>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28'}>
                                        Order For
                                    </h5>
                                    <span>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={''}>
                                        {data.order_for}
                                    </p>
                                </div>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28'}>
                                        Order Table
                                    </h5>
                                    <span>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={''}>
                                        {data.order_table}
                                    </p>
                                </div>
                                <div className={'text-sm sm:text-xl flex items-start'}>
                                    <h5 className={'min-w-28'}>
                                        Order Date
                                    </h5>
                                    <span>
                            &nbsp;:&nbsp;
                        </span>
                                    <p className={''}>
                                        {formatDateTimeShortString(data.created_at)}
                                    </p>
                                </div>
                            </div>
                            <h5 className={`text-sm sm:text-xl font-bold ${data.status === 1 ? `text-[#F9A825]` : data.status === 3 ? `text-[#47DC53]` : data.status === 2 ? `text-[#DDE232]` : ``} `}>
                                {
                                    data.status_label
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
                            className={'flex font-bold text-xl sm:text-3xl mt-10 justify-between border-t border-gray-300 pt-5'}>
                            <h4 className={''}>
                                Total
                            </h4>
                            <h4>
                                {formatCurrency(data.total_price)}
                            </h4>
                        </div>
                    </div>
            }
        </section>
    );
}

export default DetailTransactionPage;
