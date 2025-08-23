import {useEffect} from "react";
import useOrder from "../../hook/useOrder.ts";
import CardTransactionSkeleton from "../../component/ui/Skeleton/CardTransactionSkeleton.tsx";
import CardTransaction from "../../component/ui/card/CardTransaction.tsx";

const TransactionPage = () => {

    const {getOrder, page, data, totalData, handlePaginate, loading} = useOrder();

    useEffect(() => {
        const fetchData = async () => {
            getOrder()
        }
        fetchData()
    }, []);


    return (
        <section className="container mx-auto my-10">
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Transactions
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-5xl'}>
                    Transactions
                </h4>
            </div>
            {
                loading ?
                    Array.from({length: 10}).map((_, index) => (
                            <CardTransactionSkeleton key={index}/>
                        )
                    ) :
                    totalData === 0 ?
                        <div className={'mt-10 bg-white p-8 rounded-2xl text-center'}>
                            <h4 className={'text-xl font-bold'}>
                                No Transactions Found
                            </h4>
                        </div> :
                        data.map((transaction, index) => (
                            <CardTransaction key={index}/>
                        ))
            }
        </section>
    );
}

export default TransactionPage;
