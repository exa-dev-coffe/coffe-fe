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

    useEffect(
        () => {
            const fetchData = async () => {
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
                        ;
                        setOptions(optionsFiltered)
                    }
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

    return (
        <section className={''}>
            <div className={'sm:h-[880px] h-[900px] relative'}>
                <img src={BgHome} alt='Home'/>
                <div className={'px-4'}>
                    <div
                        data-aos="fade-up" data-aos-duration={1000}
                        className={'bg-white md:w-2xl absolute p-10 top-1/2 px-4  left-1/2 transform -translate-x-1/2 -translate-y-1/2  rounded-lg shadow-lg text-center'}>
                        <div data-aos="fade-up">
                            <h2 className={'text-3xl mb-4 font-bold'}>
                                Welcome to Diskusi Coffee,
                            </h2>
                            <p>
                                Choose your table
                            </p>
                            <div className={'flex md:flex-row flex-col bg-[#F8F9F9]  gap-10 p-4 rounded-4xl'}>
                                <img src={ImgCardHome} alt='Card Home' className={'mx-auto h-40 '}/>
                                <div className={'text-start space-y-6'}>
                                    <p>
                                        Every table has a story.
                                        Choose the one that fits you
                                        best.
                                    </p>
                                    <DropDown
                                        name={'meja'}
                                        options={options}
                                        placeholder={'Select Table'}
                                        setValue={handleSelected}
                                        setOptions={setOptions}
                                        value={selectedTable}
                                    />
                                </div>
                            </div>
                            <div className={'flex items-center justify-center gap-4 mt-6'}>
                                <button onClick={handleSkip}
                                        className={'btn-primary-outline w-full px-10 py-3 rounded-xl font-bold'}>Skip
                                </button>
                                <button onClick={handleNext}
                                        className={'btn-primary w-full px-10 py-3 rounded-xl font-bold text-white'}>Next
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