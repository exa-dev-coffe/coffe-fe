import BgHome from '../../assets/images/bgHome.webp';
import ImgCardHome from '../../assets/images/imgCardHome.png';
import DropDown from "../../component/ui/form/DropDown.tsx";
import {useEffect, useState} from "react";
import useTable from "../../hook/useTable.ts";
import useCartContext from "../../hook/useCartContext.ts";
import {useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import Cookie from "../../utils/cookie.ts";
import type {CartData} from "../../context/cart/CartContext.ts";

const HomePage = () => {

    const {getTableOptions, setOptions, options} = useTable()
    const cart = useCartContext()
    const navigate = useNavigate();
    const notification = useNotificationContext();
    const [selectedTable, setSelectedTable] = useState<{
        value: number;
        label: string;
    } | null>(null);
    const [loadingPage, setLoadingPage] = useState(true);

    useEffect(
        () => {
            const fetchData = async () => {
                try {
                    const res = await getTableOptions()
                    const cookieCart = Cookie.get('cart');
                    const data: CartData = cookieCart ? JSON.parse(cookieCart) : null;
                    if (res && data) {
                        const table = res.data.find((table) => table.id === data.tableId);
                        if (table) {
                            setSelectedTable({
                                value: table.id,
                                label: table.name
                            });
                            const optionsFiltered = res.data.filter((table) => table.id !== data.tableId).map((table) => ({
                                value: table.id,
                                label: table.name
                            }));
                            setOptions(optionsFiltered)
                        }
                    }
                } finally {
                    setLoadingPage(false);
                }
            }
            fetchData();
        }, []
    )

    const handleSelected = (value: { value: number; label: string } | null) => {
        setSelectedTable(value);
    }

    const handleSkip = () => {
        navigate('/menu');
    }

    const handleNext = () => {
        if (selectedTable) {
            cart.setTable({
                tableId: selectedTable.value,
                tableName: selectedTable.label,
            })
            navigate('/menu');
        } else {
            notification.warningNotificationClient('Please select a table')
        }
    }

    return (
        <section className={'bg-white dark:bg-gray-900 min-h-screen'}>
            <div className={'sm:h-[880px] h-[900px] relative'}>
                <img src={BgHome} alt="Coffee shop interior background" className="w-full h-full object-cover"/>
                <div className={'px-4'}>
                    <div
                        data-aos="fade-up" data-aos-duration={1000}
                        className={'bg-white md:w-2xl w-[calc(100%-2rem)] absolute p-8 sm:p-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-lg text-center dark:bg-gray-800 dark:shadow-none'}>
                        <div data-aos="fade-up">
                            <h2 className={'text-3xl mb-4 font-bold text-gray-900 dark:text-gray-100'}>
                                Welcome to Diskusi Coffee,
                            </h2>
                            <p className={'text-gray-700 dark:text-gray-300'}>
                                Choose your table
                            </p>
                            <div
                                className={'flex md:flex-row flex-col bg-[#F8F9F9] dark:bg-gray-700 gap-10 p-4 rounded-2xl'}>
                                <img src={ImgCardHome} alt='Table illustration' className={'mx-auto h-40'}/>
                                <div className={'text-start space-y-6'}>
                                    <p className={'text-gray-700 dark:text-gray-300'}>
                                        Every table has a story.
                                        Choose the one that fits you
                                        best.
                                    </p>
                                    {loadingPage ? (
                                        <div className="h-12 shimmer rounded-lg w-full"/>
                                    ) : (
                                        <DropDown
                                            name={'meja'}
                                            options={options}
                                            placeholder={'Select Table'}
                                            setValue={handleSelected}
                                            setOptions={setOptions}
                                            value={selectedTable}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className={'flex items-center justify-center gap-4 mt-6'}>
                                <button onClick={handleSkip}
                                        className={'btn-primary-outline w-full px-10 py-3 rounded-xl'}>
                                    Skip
                                </button>
                                <button onClick={handleNext}
                                        className={'btn-primary w-full px-10 py-3 rounded-xl'}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomePage;