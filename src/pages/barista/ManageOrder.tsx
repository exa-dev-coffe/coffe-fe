import HeaderDashboard from "../../component/HeaderDashboard.tsx";
import {formatCurrency, formatDateTime} from "../../utils";
import {HiDotsHorizontal} from "react-icons/hi";

const ManageOrderPage = () => {
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
                               className={'p-2 border border-gray-300 rounded-lg'}/>
                    </div>
                </div>
                <div className={'py-4 border-y border-gray-300 grid grid-cols-6 items-center gap-4'}>
                    <div className={'space-y-4'}>
                        <h4>
                            {
                                formatDateTime(new Date().toISOString())
                            }
                        </h4>
                        <p>
                            test
                        </p>
                    </div>
                    <div>
                        <h4>Order By</h4>
                        <p className={'text-sm text-gray-500'}>Nama</p>
                    </div>
                    <div>
                        <h4>Table</h4>
                        <p className={'text-sm text-gray-500'}>Nama Table</p>
                    </div>
                    <div>
                        <h4>Price</h4>
                        <p className={'text-sm text-gray-500'}>{
                            formatCurrency(1000)
                        }</p>
                    </div>
                    <div className={'flex items-center gap-4 flex-col'}>
                        <h4>Status</h4>
                        <span className={'badge-danger rounded-lg'}>
                            Confirm Now
                        </span>
                    </div>
                    <div className={'flex justify-center items-center'}>
                        <HiDotsHorizontal className={'bg-black text-white text-2xl rounded-full'}/>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default ManageOrderPage;