import HeaderDashboard from "../../../component/ui/HeaderDashboard.tsx";
import DummyProduct from '../../../assets/images/dummyProduct.png'

const ManageCatalogPage = () => {
    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'Manage Catalog'}
                             description={`you can organize and manage all items available in your menu.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <h4 className={'text-xl font-semibold'}>
                        Menu
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input placeholder={'Search'}
                                   className={'focus:ring-gray-300 border rounded-lg border-gray-300 placeholder-gray-400 p-2'}/>
                        </div>
                        <button className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                            Add
                        </button>
                    </div>
                </div>
                <div className={"mt-6"}>
                    <div className={'py-4 border-y border-gray-300'}>
                        <img className={'w-12'} src={DummyProduct} alt={'Product'}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageCatalogPage;