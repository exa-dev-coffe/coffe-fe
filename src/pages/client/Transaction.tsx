import {useEffect, useRef, useState} from "react";
import useOrder from "../../hook/useOrder.ts";
import CardTransactionSkeleton from "../../component/ui/Skeleton/CardTransactionSkeleton.tsx";
import CardTransaction from "../../component/ui/card/CardTransaction.tsx";

const TransactionPage = () => {

    const {getOrder, page, data, totalData, handlePaginate, loading} = useOrder();
    const refLoader = useRef<HTMLDivElement>(null);
    const isMaxScroll = page * 10 >= totalData;
    const [loadingFirst, setLoadingFirst] = useState(true);
    const [maxItems, setMaxItems] = useState(4)


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
        const updateMaxItem = () => {
            const width = window.innerWidth
            if (width >= 1280) setMaxItems(4)       // xl ke atas
            else if (width >= 1024) setMaxItems(3)  // lg
            else if (width >= 768) setMaxItems(2)   // sm
            else setMaxItems(1)                     // sangat kecil
        }

        updateMaxItem()

        window.addEventListener('resize', updateMaxItem)
        return () => window.removeEventListener('resize', updateMaxItem)
    }, []);


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
        <section className="container mx-auto my-10 px-4">
            <div className={'flex gap-5'}>
                <h4 className={'text-gray-900 dark:text-gray-100'}>
                    Menu
                </h4>
                <span className={'text-gray-600 dark:text-gray-400'}>
                    /
                </span>
                <h4 className={'font-bold text-gray-900 dark:text-gray-100'}>
                    Transactions
                </h4>
            </div>
            <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-3xl sm:text-5xl text-gray-900 dark:text-gray-100'}>
                    Transactions
                </h4>
            </div>
            {
                loadingFirst ?
                    Array.from({length: 10}).map((_, index) => (
                            <CardTransactionSkeleton maxItems={maxItems} key={index}/>
                        )
                    ) :
                    totalData === 0 ?
                        <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl text-center'}>
                            <h4 className={'text-xl font-bold text-gray-900 dark:text-gray-100'}>
                                No Transactions Found
                            </h4>
                        </div> :
                        data.map((transaction, index) => (
                            <CardTransaction maxItems={maxItems} key={index} {...transaction}/>
                        ))
            }
            {
                !isMaxScroll &&
                <div ref={refLoader} className={'flex mt-10 flex-col justify-center items-center w-full'}>
                    <div className="spinner mx-auto mb-4"/>
                    <p className={'text-gray-700 dark:text-gray-300'}>Load More ...</p>
                </div>
            }
        </section>
    );
}

export default TransactionPage;