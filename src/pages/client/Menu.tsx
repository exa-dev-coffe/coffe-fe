import BgMenu from '../../assets/images/bgMenu.png';
import DummyProduct from '../../assets/images/dummyProduct.png';
import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";
import {Link, useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import {HiMiniMagnifyingGlass} from "react-icons/hi2";
import DropDown from "../../component/ui/form/DropDown.tsx";
import useCategory from "../../hook/useCategory.ts";
import {FaRegThumbsUp} from "react-icons/fa";

const MenuPage = () => {

    const {getCategoryOptions, setOptions, options} = useCategory()
    const [filter, setFilter] = useState({
        showSearch: '',
        search: '',
        kategori: {
            value: 0,
            label: '',
        },
    })
    const [cookie, setCookie] = useCookies()
    const cart = useCartContext()
    const navigate = useNavigate();
    const notification = useNotificationContext();
    const [selectedTable, setSelectedTable] = useState<{
        value: number;
        label: string;
    } | null>(null);

    useEffect(
        () => {
            const fetchData = async () => {
                await getCategoryOptions()
            }
            fetchData();
        }, []
    )

    const handleSelected = (value: { value: number; label: string } | null) => {
        setSelectedTable(value);
        if (!value) {
            cart.setCart({
                ...cart.cart,
                table_id: 0,
                table_name: '',
            })
        }
    }

    const handleSkip = () => {
        navigate('/menu');
    }

    const handleNext = () => {
        if (selectedTable) {
            cart.setCart({
                ...cart.cart,
                table_id: selectedTable.value,
                table_name: selectedTable.label,
            })
            navigate('/menu');
        } else {
            notification.setNotification({
                isShow: true,
                message: 'Please select a table',
                type: 'warning',
                duration: 1000,
                mode: 'client',
                size: 'md',
            })
        }
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilter({
            ...filter,
            showSearch: filter.search
        });
        navigate('/menu', {
            state: {
                search: filter.search,
                kategori: filter.kategori.value
            }
        });
    }

    return (
        <section className={'relative flex items-center flex-col w-full'}>
            <img src={BgMenu} className={'h-[550px] absolute w-full'} alt='Menu'/>
            <div className={'absolute mx-auto w-full my-32 '}>
                <h2 className={'text-6xl font-bold text-white text-center'}>Catalog Menu</h2>
                <p className={'text-white text-center mt-4 text-2xl'}>
                    Welcome to our Catalog Menu, where every dish is a carefully curated experience designed to delight
                    your senses.
                </p>
            </div>
            <div className={'bg-white p-10 z-1 w-[90%] mt-80'}>
                <h3 className={'font-bold text-3xl  text-center mb-4'}>
                    Discover Your Best Choices
                </h3>
                <form onSubmit={handleSearch}
                      className={'flex mx-auto items-center w-1/2 justify-center border-1 my-10 rounded-full '}>
                    <input className={'px-4 focus:outline-none py-3 w-full'} placeholder={'Search ....'}
                           value={filter.search}/>
                    <button type="submit"
                            className={'btn-primary text-white p-1 rounded-full font-bold'}>
                        <HiMiniMagnifyingGlass className={'text-4xl '}/>
                    </button>
                </form>
                <div className={'flex mx-auto items-center justify-between  w-1/2'}>
                    <p>
                        Result : {filter.showSearch}
                    </p>
                    <div className={'w-56'}>
                        <DropDown
                            options={options}
                            setOptions={setOptions}
                            placeholder={'All Category'}
                            name={'category'}
                            value={selectedTable}
                            setValue={handleSelected}
                        />
                    </div>
                </div>
                <div className={'grid-cols-4 mt-10 gap-10 grid mx-auto items-center justify-between  w-1/2'}>
                    <Link to={'/manu/1'}
                          className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl'}>
                        <img src={DummyProduct} alt={'Dummy Product'}
                             className={'w-full h-44 object-cover rounded-2xl'}/>
                        <div className={'absolute top-2 right-1 '}>
                            <button
                                className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                                <FaRegThumbsUp/>
                                <span className={'text-xs'}>4.5</span>
                            </button>
                        </div>
                        <h4 className={'text-center mt-2'}>
                            <span className={'font-bold text-lg'}>Cappuccino</span>
                        </h4>
                    </Link> <Link to={'/manu/1'}
                                  className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl'}>
                    <img src={DummyProduct} alt={'Dummy Product'}
                         className={'w-full h-44 object-cover rounded-2xl'}/>
                    <div className={'absolute top-2 right-1 '}>
                        <button
                            className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                            <FaRegThumbsUp/>
                            <span className={'text-xs'}>4.5</span>
                        </button>
                    </div>
                    <h4 className={'text-center mt-2'}>
                        <span className={'font-bold text-lg'}>Cappuccino</span>
                    </h4>
                </Link> <Link to={'/manu/1'}
                              className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl'}>
                    <img src={DummyProduct} alt={'Dummy Product'}
                         className={'w-full h-44 object-cover rounded-2xl'}/>
                    <div className={'absolute top-2 right-1 '}>
                        <button
                            className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                            <FaRegThumbsUp/>
                            <span className={'text-xs'}>4.5</span>
                        </button>
                    </div>
                    <h4 className={'text-center mt-2'}>
                        <span className={'font-bold text-lg'}>Cappuccino</span>
                    </h4>
                </Link> <Link to={'/manu/1'}
                              className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl'}>
                    <img src={DummyProduct} alt={'Dummy Product'}
                         className={'w-full h-44 object-cover rounded-2xl'}/>
                    <div className={'absolute top-2 right-1 '}>
                        <button
                            className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                            <FaRegThumbsUp/>
                            <span className={'text-xs'}>4.5</span>
                        </button>
                    </div>
                    <h4 className={'text-center mt-2'}>
                        <span className={'font-bold text-lg'}>Cappuccino</span>
                    </h4>
                </Link> <Link to={'/manu/1'}
                              className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl'}>
                    <img src={DummyProduct} alt={'Dummy Product'}
                         className={'w-full h-44 object-cover rounded-2xl'}/>
                    <div className={'absolute top-2 right-1 '}>
                        <button
                            className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                            <FaRegThumbsUp/>
                            <span className={'text-xs'}>4.5</span>
                        </button>
                    </div>
                    <h4 className={'text-center mt-2'}>
                        <span className={'font-bold text-lg'}>Cappuccino</span>
                    </h4>
                </Link> <Link to={'/manu/1'}
                              className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-200 pb-3 rounded-2xl'}>
                    <img src={DummyProduct} alt={'Dummy Product'}
                         className={'w-full h-44 object-cover rounded-2xl'}/>
                    <div className={'absolute top-2 right-1 '}>
                        <button
                            className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                            <FaRegThumbsUp/>
                            <span className={'text-xs'}>4.5</span>
                        </button>
                    </div>
                    <h4 className={'text-center mt-2'}>
                        <span className={'font-bold text-lg'}>Cappuccino</span>
                    </h4>
                </Link>

                </div>
            </div>
        </section>
    )
}

export default MenuPage;