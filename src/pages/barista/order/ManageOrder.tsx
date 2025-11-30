// ManageOrder.tsx
import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import CardOrdersBarista from "../../../component/ui/card/CardOrdersBarista.tsx";
import useOrder from "../../../hook/useOrder.ts";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import {formatDate} from "../../../utils";

const ManageOrderPage = () => {

    const {getOrder, page, data, loading, totalData, handlePaginate,} = useOrder()

    const [search, setSearch] = useState('');
    const searchDebounce = useDebounce(handlePaginate, 1000);

    useEffect(
        () => {
            getOrder();
        }
        , []
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchValue = e.target.value;
        setSearch(searchValue);
        searchDebounce(1, {
            search: searchValue,
            startDate: formatDate(new Date().toISOString()),
            endDate: formatDate(new Date().toISOString())
        });
    }


    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'Manage Orders'}
                             description={`You can organize and manage all your orders.`}/>
            <div
                className={'mt-10 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 text-gray-900 dark:text-gray-100 p-8 rounded-lg transition-colors'}>
                <div className={'flex items-center sm:flex-row flex-col gap-5 justify-between'}>
                    <h4 className={'text-xl font-semibold text-gray-900 dark:text-gray-100'}>
                        Orders
                    </h4>
                    <div className={'flex items-center gap-4'}>
                        <input
                            type="text"
                            placeholder={'Search orders...'}
                            onChange={handleChange}
                            className={'p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 transition-colors'}
                        />
                    </div>
                </div>
                <div className={'mt-10'}>
                    {
                        loading ? <Loading/>
                            : totalData === 0 ?
                                <p className="p-5 text-center text-gray-700 dark:text-gray-300">No data found</p> :
                                <>
                                    <div className={"mt-6 overflow-x-auto w-full"}>
                                        {
                                            data.map((order, index) => (
                                                <CardOrdersBarista key={index} {...order}/>
                                            ))
                                        }
                                    </div>
                                    <div className={'flex justify-end mt-10'}>
                                        <PaginationDashboard currentPage={page}
                                                             onPageChange={handlePaginate}
                                                             query={{search}}
                                                             totalData={totalData}/>
                                    </div>
                                </>
                    }
                </div>
            </div>

        </div>
    );
}

export default ManageOrderPage;