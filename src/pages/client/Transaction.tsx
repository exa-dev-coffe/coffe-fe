import {useEffect, useRef, useState} from "react";
import useOrder from "../../hook/useOrder.ts";
import CardTransactionSkeleton from "../../component/ui/Skeleton/CardTransactionSkeleton.tsx";
import CardTransaction from "../../component/ui/card/CardTransaction.tsx";

const TransactionPage = () => {

    const {getOrder, page, data, totalData, handlePaginate, loading} = useOrder();
    const refLoader = useRef<HTMLDivElement>(null);
    const isMaxScroll = page * 10 >= totalData;
    const [loadingFirst, setLoadingFirst] = useState(true);

    useEffect(() => {
        const target = refLoader.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !isMaxScroll) {
                    handlePaginate(page + 1, {search: ''});
                }
            }, {
                threshold: 1
            }
        )

        if (target && !loading && !isMaxScroll) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        }

    }, [page, loading]);


    useEffect(() => {
        const fetchData = async () => {
            try {

                await getOrder()
            } finally {
                setLoadingFirst(false)
            }
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
                loadingFirst ?
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
                            <CardTransaction key={index} {...transaction}/>
                        ))
            }
            {
                !isMaxScroll &&
                <div ref={refLoader} className={'flex mt-10 flex-col justify-center items-center w-full'}
                >
                    <div className="spinner mx-auto mb-4">
                    </div>
                    <p>Load More ...</p>
                </div>
            }
        </section>
    );
}

export default TransactionPage;
