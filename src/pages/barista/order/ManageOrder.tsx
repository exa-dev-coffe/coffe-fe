import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import CardOrdersBarista from "../../../component/ui/card/CardOrdersBarista.tsx";
import useOrder from "../../../hook/useOrder.ts";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import {formatDate} from "../../../utils";
import Card from "../../../component/ui/Card.tsx";

const ManageOrderPage = () => {

    const {getOrder, page, data, loading, totalData, handlePaginate} = useOrder()

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
                             description={'Organize and manage all your orders.'}/>
            <Card variant="dashboard" className="mt-10">
                <div className={'flex items-center sm:flex-row flex-col gap-5 justify-between'}>
                    <h4 className={'text-xl font-semibold text-gray-900 dark:text-gray-100'}>
                        Orders
                    </h4>
                    <div className={'flex items-center gap-4'}>
                        <input
                            type="text"
                            placeholder={'Search orders...'}
                            onChange={handleChange}
                            aria-label="Search orders"
                            className={'p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus-ring'}
                        />
                    </div>
                </div>
                <div className={'mt-10'}>
                    {
                        loading ? <Loading/>
                            : totalData === 0 ?
                                <div className="p-10 text-center text-gray-700 dark:text-gray-300">
                                    <p className="text-lg font-medium">No orders found</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Orders will appear here once customers place them.</p>
                                </div> :
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
            </Card>
        </div>
    );
}

export default ManageOrderPage;