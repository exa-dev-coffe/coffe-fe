import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import useOrder from "../../../hook/useOrder.ts";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import CardListProductByOrder from "../../../component/ui/card/CardListProductByOrder.tsx";
import {useNavigate, useParams} from "react-router";
import type {Order} from "../../../model/order.ts";
import NotFoundPage from "../../404.tsx";
import Modal from "../../../component/ui/Modal.tsx";

const DetailrderPage = () => {

    const {getOrderById, loading, updateStatusOrder} = useOrder()
    const params = useParams<Readonly<{ id: string }>>()
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState<Order>();
    const [notFound, setNotFound] = useState(false);
    const navigate = useNavigate();

    useEffect(
        () => {
            const fetchData = async () => {
                const res = await getOrderById(Number(params.id));
                if (res) {
                    setData(res.data);
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
        'btn-danger text-white',
        'btn-warn text-black',
        'hidden text-white',
    ]

    const textModal = [
        'Are you sure want to confirm this order? \n Please check the order details before confirming.',
        'Are you sure want to complete this order? \n Please check the order details before completing.',
    ]

    const textButton = [
        'Confirm Order',
        'Complete Order',
    ]

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const handleUpdateStatus = async () => {
        try {
            if (!data) return;
            await updateStatusOrder({id: data.id});
            navigate('/dashboard-barista/manage-order')
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    }

    if (notFound) {
        return <NotFoundPage/>
    }

    return (
        <div className={'container mx-auto px-4 '}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10'}>
                    <h4 className={'sm:text-2xl text-base  font-semibold text-center mb-4'}>
                        {
                            textModal[data?.orderStatus || 0]
                        }
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            handleUpdateStatus
                        } className={'btn-primary text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                            Yes
                        </button>
                        <button className={'btn-danger text-white px-10 w-32 font-semibold py-2 rounded-lg'}
                                onClick={handleCloseModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            <HeaderDashboard title={'Manage Orders'}
                             description={`You can organize and manage all your orders.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                {
                    data &&
                    <div className={'flex sm:flex-row flex-col gap-5 items-center    justify-between'}>
                        <h4 className={'text-xl font-semibold'}>
                            Orders
                        </h4>
                        <div className={'flex items-center gap-4'}>
                            <button
                                onClick={() => setShowModal(true)}
                                className={` px-10 font-semibold py-2 rounded-lg ${classButton[data?.orderStatus || 0]}`}>
                                {
                                    textButton[data?.orderStatus || 0]
                                }
                            </button>
                        </div>
                    </div>
                }
                <div className={'mt-10'}>
                    {
                        loading ? <Loading/>
                            :
                            <>
                                <div
                                    className={'mt-6 grid gap-10 md:grid-cols-4 sm:grid-cols-3 grid-cols-1'}>
                                    {
                                        data?.details?.map((item, index) => {
                                            return (
                                                <CardListProductByOrder key={index} name={item.menuName}
                                                                        qty={item.qty}
                                                                        image={`${item.photo}`}/>
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