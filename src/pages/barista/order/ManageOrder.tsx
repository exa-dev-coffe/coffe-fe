import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import CardOrdersBarista from "../../../component/ui/card/CardOrdersBarista.tsx";
import useOrder from "../../../hook/useOrder.ts";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";

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
        searchDebounce(1, {search: searchValue});
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
                        <input type="text" placeholder={'Search orders...'}
                               onChange={handleChange}
                               className={'p-2 border border-gray-300 rounded-lg'}/>
                    </div>
                </div>
                <div className={'mt-10'}>
                    {
                        loading ? <Loading/>
                            : totalData === 0 ? <p className="p-5 text-center">No data found</p> :
                                <>
                                    <div className={'mt-6'}>
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