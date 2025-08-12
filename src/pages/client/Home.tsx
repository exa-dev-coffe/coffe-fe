import BgHome from '../../assets/images/bgHome.png';
import ImgCardHome from '../../assets/images/imgCardHome.png';
import DropDown from "../../component/ui/form/DropDown.tsx";
import {useEffect, useState} from "react";
import useTable from "../../hook/useTable.ts";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";

const HomePage = () => {

    const {getTableOptions, setOptions, options} = useTable()
    const [cookie, setCookie] = useCookies()
    const cart = useCartContext()
    const [selectedTable, setSelectedTable] = useState<{
        value: number;
        label: string;
    } | null>(null);

    useEffect(
        () => {
            const fetchData = async () => {
                const res = await getTableOptions()
                if (res && cookie.cart) {
                    const table = res.data.find((table) => table.id === cookie.cart.table_id);
                    if (table) {
                        setSelectedTable({
                            value: table.id,
                            label: table.name
                        });
                        const optionsFiltered = res.data.filter((table) => table.id === cookie.cart.table_id).map((table) => ({
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
        if (value) {
            cart.setCart({
                ...cart.cart,
                table_id: value.value,
                table_name: value.label,
            })
        } else {
            cart.setCart({
                ...cart.cart,
                table_id: 0,
                table_name: '',
            })
        }
    }

    return (
        <section className={'relative'}>
            <img src={BgHome} alt='Home'/>
            <div
                className={'bg-white w-2xl absolute p-10 top-1/2 mt-28 left-1/2 transform -translate-x-1/2 -translate-y-1/2  rounded-lg shadow-lg text-center'}>
                <h2 className={'text-3xl mb-4 font-bold'}>
                    Welcome to Diskusi Coffee,
                </h2>
                <p>
                    Choose your table
                </p>
                <div className={'flex bg-[#F8F9F9]  gap-10 p-4 rounded-4xl'}>
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
                    <button className={'btn-primary-outline w-full px-10 py-3 rounded-xl font-bold'}>Skip</button>
                    <button className={'btn-primary w-full px-10 py-3 rounded-xl font-bold text-white'}>Next</button>
                </div>
            </div>
        </section>
    )
}

export default HomePage;