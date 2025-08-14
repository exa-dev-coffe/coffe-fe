import BgMenu from '../../assets/images/bgMenu.png';
import {useEffect, useState} from "react";
import useTable from "../../hook/useTable.ts";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";
import {useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import {HiMiniMagnifyingGlass} from "react-icons/hi2";

const MenuPage = () => {

    const {getTableOptions, setOptions, options} = useTable()
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
            <div className={'bg-white z-1 w-[90%] mt-80'}>
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
            </div>
        </section>
    )
}

export default MenuPage;