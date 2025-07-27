import HeaderDashboard from "../../../component/ui/HeaderDashboard.tsx";
import DummyProduct from '../../../assets/images/dummyProduct.png'
import {useState} from "react";
import {IoIosSquare} from "react-icons/io";
import {HiPencilAlt} from "react-icons/hi";
import {BiSolidTrash} from "react-icons/bi";

const ManageCatalogPage = () => {

    const [open, setOpen] = useState(false);
    const [is_available, setIsAvailable] = useState(false);
    const description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
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
                    <div className={'py-4 border-y border-gray-300 flex items-start gap-4'}>
                        <img className={'w-12'} src={DummyProduct} alt={'Product'}/>
                        <div>
                            <h4>Product</h4>
                            <p className={'text-gray-500'}>Rating : 5.0</p>
                        </div>
                        <div>
                            <h4>Description</h4>
                            <div>

                                <p className={`text-gray-500 w-56 ${open ? 'break-words' : 'truncate'}`}>
                                    {
                                        description
                                    }
                                </p>
                                {
                                    description.length > 29 && <button onClick={() => setOpen(!open)}
                                                                       className={'text-blue-500 text-xs hover:text-blue-700 transition-all duration-300'}>
                                        {open ? 'Show Less' : 'Show More'}
                                    </button>
                                }
                            </div>
                        </div>
                        <div>
                            <h4>Price</h4>
                            <p className={'text-gray-500'}>$10.00</p>
                        </div>
                        <div>
                            <h4>Status</h4>
                            <div className={'flex items-center gap-2'}>
                                {
                                    is_available ?
                                        <>
                                            <span className={'text-lg text-green-500'}><IoIosSquare/></span>
                                            <p className={'text-gray-500'}>Available</p>
                                        </>
                                        :
                                        <>
                                            <span className={'text-lg text-red-500'}><IoIosSquare/></span>
                                            <p className={'text-gray-500'}>Unavailable</p>
                                        </>
                                }
                            </div>
                        </div>
                        <div>
                            <h4 className={'text-center'}>
                                Status
                            </h4>
                            <div className={'flex items-center gap-2'}>

                                <HiPencilAlt className={'color-primary text-3xl'}/>
                                <BiSolidTrash className={'text-red-500 text-3xl cursor-pointer'}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageCatalogPage;