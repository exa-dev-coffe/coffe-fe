import BgMenu from '../../assets/images/bgMenu.png';
import {useEffect, useState} from "react";
import useTable from "../../hook/useTable.ts";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";
import {useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";

const MenuPage = () => {

    const {getTableOptions, setOptions, options} = useTable()
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
                const res = await getTableOptions()
                if (res && cookie.cart) {
                    const table = res.data.find((table) => table.id === cookie.cart.table_id);
                    if (table) {
                        setSelectedTable({
                            value: table.id,
                            label: table.name
                        });
                        const optionsFiltered = res.data.filter((table) => table.id !== cookie.cart.table_id).map((table) => ({
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

    return (
        <section className={'relative w-full'}>
            <img src={BgMenu} className={'h-[550px] absolute w-full'} alt='Menu'/>
            <div className={'absolute mx-auto w-full my-32 '}>
                <h2 className={'text-6xl font-bold text-white text-center'}>Catalog Menu</h2>
                <p className={'text-white text-center mt-4 text-2xl'}>
                    Welcome to our Catalog Menu, where every dish is a carefully curated experience designed to delight
                    your senses.
                </p>
            </div>
            <div className={'bg-white container mx-auto absolute'}>
                <h3>
                    Discover Your Best Choices
                </h3>
            </div>
        </section>
    )
}

export default MenuPage;