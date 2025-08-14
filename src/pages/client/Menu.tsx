import BgMenu from '../../assets/images/bgMenu.png';
import DummyProduct from '../../assets/images/dummyProduct.png';
import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import useCartContext from "../../hook/useCartContext.ts";
import {useNavigate} from "react-router";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import {HiMiniMagnifyingGlass} from "react-icons/hi2";
import DropDown from "../../component/ui/form/DropDown.tsx";
import useCategory from "../../hook/useCategory.ts";
import CardMenu from "../../component/ui/card/CardMenu.tsx";

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
        if (value) {
            setSelectedTable(value);
            setFilter({
                ...filter,
                kategori: value,
            });
        } else {
            setSelectedTable(null);
            setFilter({
                ...filter,
                kategori: {value: 0, label: ''},
            });
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({
            ...filter,
            search: e.target.value,
        });
    }

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilter({
            ...filter,
            showSearch: filter.search
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
            <div className={'bg-white p-10 rounded-2xl mb-10 z-1 w-[90%] mt-80'}>
                <h3 className={'font-bold text-3xl  text-center mb-4'}>
                    Discover Your Best Choices
                </h3>
                <form onSubmit={handleSearch}
                      className={'flex mx-auto items-center w-1/2 justify-center border-1 my-10 rounded-full '}>
                    <input className={'px-4 focus:outline-none py-3 w-full'} onChange={handleChange}
                           placeholder={'Search ....'}
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
                    {
                        Array.from({length: 8}).map((_, index) => (
                            <CardMenu
                                key={index}
                                index={index + 1}
                                id={index + 1}
                                photo={DummyProduct}
                                name={`Menu Item ${index + 1}`}
                                rating={5}
                            />
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

export default MenuPage;