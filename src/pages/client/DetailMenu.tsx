import {IoStarSharp} from "react-icons/io5";
import DummyProduct from "../../assets/images/dummyProduct.png";
import {formatCurrency} from "../../utils";

const DetailMenu = () => {
    return (
        <section className="container mx-auto mt-10">
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Details
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-3xl'}>
                    {'Nama Product'}
                </h4>
                <div className={'flex items-center text-2xl'}>
                    {
                        Array.from({length: 5}).map((_, index: number) => {
                            return (
                                <span key={index} className={'text-gray-500'}>
                                <IoStarSharp className={''}/>
                            </span>
                            );
                        })
                    }
                    <h5 className={'ms-4 text-xl'}>
                        ({'4.5'})
                    </h5>
                </div>
            </div>
            <div className={'flex gap-5'}>
                <div className={'mt-10 w-full bg-white p-8 rounded-2xl flex justify-between items-center'}>
                    <img src={DummyProduct} className={'w-full rounded-2xl h-96 object-cover'} alt={'{nama}'}/>
                </div>
                <div className={'mt-10 bg-white p-8 grow rounded-2xl'}>
                    <h3 className={'text-2xl font-bold'}>
                        {"Nama Product"}
                    </h3>
                    <div className={'flex items-center gap-2 text-xl'}>
                        <h5 className={'font-bold text-gray-700  text-xl'}>
                            {formatCurrency(10000)}
                        </h5>
                        |
                        <p className={'text-gray-400'}>
                            Stok Tersedia
                        </p>
                    </div>
                    <p className={'text-gray-600 mt-8'}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <button>
                        Add to Cart
                    </button>
                </div>
            </div>
        </section>
    );
}

export default DetailMenu;