import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import useOrder from "../../../hook/useOrder.ts";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import CardListProductByOrder from "../../../component/ui/card/CardListProductByOrder.tsx";
import {useParams} from "react-router";
import type {Order} from "../../../model/order.ts";
import NotFoundPage from "../../404.tsx";

const DetailrderPage = () => {

    const {getOrder, loading} = useOrder()
    const params = useParams<Readonly<{ id: string }>>()
    const [search, setSearch] = useState('');
    const [data, setData] = useState<Order>({});
    const [notFound, setNotFound] = useState(false);

    useEffect(
        () => {
            const fetchData = async () => {
                const res = await getOrder(true, Number(params.id));
                if (res) {
                    setData(res as Order);
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
            }

            fetchData();
        }
        , []
    )

    const classButton = [
        null,
        'btn-danger',
        'btn-warning',
        'btn-primary',
    ]

    const textModal = [
        null,
        'Are you sure want to confirm this order? \n Please check the order details before confirming.',
        'Are you sure want to complete this order? \n Please check the order details before completing.',
    ]

    const textButton = [
        null,
        'Confirm Order',
        'Complete Order',
    ]

    if (notFound) {
        return <NotFoundPage/>
    }

    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'Manage Orders'}
                             description={`You can organize and manage all your orders.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <h4 className={'text-xl font-semibold'}>
                        Orders
                    </h4>
                    <div className={'flex items-center gap-4'}>
                        <button
                            className={`text-white px-10 font-semibold py-2 rounded-lg ${classButton[data?.status]}`}>
                            {
                                textButton[data?.status]
                            }
                        </button>
                    </div>
                </div>
                <div className={'mt-10'}>
                    {
                        loading ? <Loading/>
                            :

                            <>
                                <div className={'mt-6 grid grid-cols-4'}>
                                    {
                                        data?.details?.map((item, index) => {
                                            return (
                                                <CardListProductByOrder key={index} name={item.menu_name}
                                                                        qty={item.qty}
                                                                        image={`${import.meta.env.VITE_APP_IMAGE_URL}/${item.photo}`}/>
                                            )

                                        })
                                    }

                                </div>
                            </>
                    }
                </div>
            </div>

        </div>
    );
}

export default DetailrderPage;