import HeaderDashboard from "../../component/HeaderDashboard.tsx";
import CardOrdersBarista from "../../component/ui/card/CardOrdersBarista.tsx";

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
                <div className={'mt-10'}>
                    <CardOrdersBarista created_at={new Date().toISOString()} order_for={"test"} order_by={'test'}
                                       order_table={";test"} total_price={1233} status={1} status_label={"Confirm Now"}
                                       id={1}/>
                    <CardOrdersBarista created_at={new Date().toISOString()} order_for={"test"} order_by={'test'}
                                       order_table={";test"} total_price={1233} status={2} status_label={"Deliver Now"}
                                       id={1}/>
                    <CardOrdersBarista created_at={new Date().toISOString()} order_for={"test"} order_by={'test'}
                                       order_table={";test"} total_price={1233} status={3} status_label={"Completed"}
                                       id={1}/>
                </div>
            </div>

        </div>
    );
}

export default ManageOrderPage;