import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import DummyProduct from "../../../assets/images/dummyProduct.png";
import {Link, Outlet, useParams} from "react-router";

const ListProductByCategory = () => {
    const params = useParams<Readonly<{ id: string }>>()

    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'Manage Categories'}
                             description={`you can organize and manage all categories available in your menu.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <div className={'flex gap-20'}>
                        <h4 className={'text-xl font-semibold'}>
                            Category
                        </h4>
                        <h4 className={'text-xl'}>
                            Category
                        </h4>
                    </div>
                    <div className={'gap-3 flex items-center'}>
                        <Link to={'/dashboard/manage-category/list-category'}
                              className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                            Back
                        </Link>
                    </div>
                </div>
                <div className={'mt-10 grid grid-cols-4'}>
                    <div className={'flex gap-4 items-center'}>
                        <img className={'w-14 h-14 rounded-sm '} src={DummyProduct} alt={'Dummy Product'}/>
                        <div>
                            <h4 className={'text-lg font-semibold'}>Product Name</h4>
                            <p className={'text-sm max-w-40 truncate text-gray-500'}>Lorem ipsumLorem ipsumLorem
                                ipsumLorem
                                ipsumLorem
                                ipsumLorem ipsum</p>
                        </div>
                    </div>
                    <div className={'flex gap-4 items-center'}>
                        <img className={'w-14 h-14 rounded-sm '} src={DummyProduct} alt={'Dummy Product'}/>
                        <div>
                            <h4 className={'text-lg font-semibold'}>Product Name</h4>
                            <p className={'text-sm text-gray-500'}>Lorem ipsum</p>
                        </div>
                    </div>
                    <div className={'flex gap-4 items-center'}>
                        <img className={'w-14 h-14 rounded-sm '} src={DummyProduct} alt={'Dummy Product'}/>
                        <div>
                            <h4 className={'text-lg font-semibold'}>Product Name</h4>
                            <p className={'text-sm text-gray-500'}>Lorem ipsum</p>
                        </div>
                    </div>
                    <div className={'flex gap-4 items-center'}>
                        <img className={'w-14 h-14 rounded-sm '} src={DummyProduct} alt={'Dummy Product'}/>
                        <div>
                            <h4 className={'text-lg font-semibold'}>Product Name</h4>
                            <p className={'text-sm text-gray-500'}>Lorem ipsum</p>
                        </div>
                    </div>
                </div>
            </div>
            <Outlet/>
        </div>
    );
}

export default ListProductByCategory;