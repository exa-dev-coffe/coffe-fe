// File: `src/pages/client/Menu.tsx`
import BgMenu from '../../assets/images/bgMenu.png';
import DummyProduct from '../../assets/images/dummyProduct.png';
import {useEffect, useRef, useState} from "react";
import {HiMiniMagnifyingGlass} from "react-icons/hi2";
import DropDown from "../../component/ui/form/DropDown.tsx";
import useCategory from "../../hook/useCategory.ts";
import CardMenu from "../../component/ui/card/CardMenu.tsx";
import useMenu from "../../hook/useMenu.ts";
import CardMenuSkeleton from "../../component/ui/Skeleton/CardMenuSkeleton.tsx";

const MenuPage = () => {

    const {getCategoryOptions, setOptions, options} = useCategory()
    const {getMenu, page, handlePaginate, loading, data, totalData} = useMenu();
    const [loadingFirst, setLoadingFirst] = useState(true);
    const refLoader = useRef<HTMLDivElement>(null)
    const isMaxScroll = page * 12 >= totalData;
    const [filter, setFilter] = useState({
        showSearch: '',
        search: '',
        kategori: {
            value: 0,
            label: '',
        },
    })
    const [selectedTable, setSelectedTable] = useState<{
        value: number;
        label: string;
    } | null>(null);

    useEffect(
        () => {
            const fetchData = async () => {
                try {
                    await Promise.all([
                        getCategoryOptions(),
                        getMenu()
                    ])
                } finally {
                    setLoadingFirst(false);
                }
            }
            fetchData();
        }, []
    )

    useEffect(() => {
        const target = refLoader.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !isMaxScroll) {
                    handlePaginate(page + 1, {
                        category_id: filter.kategori.value,
                        search: filter.showSearch,
                    });
                }
            }, {
                threshold: 1
            }
        )

        if (target && !loading && !isMaxScroll) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        }

    }, [page, loading]);

    const handleSelected = async (value: { value: number; label: string } | null) => {
        if (value) {
            setSelectedTable(value);
            setFilter({
                ...filter,
                kategori: value,
            });
            setLoadingFirst(true);
            try {
                await handlePaginate(
                    1,
                    {
                        category_id: value.value,
                        search: filter.showSearch,
                    }
                )
            } finally {
                setLoadingFirst(false);
            }
        } else {
            setSelectedTable(null);
            setFilter({
                ...filter,
                kategori: {value: 0, label: ''},
            });
            setLoadingFirst(true);
            try {
                await handlePaginate(
                    1,
                    {
                        search: filter.showSearch,
                    }
                )
            } finally {
                setLoadingFirst(false);
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter({
            ...filter,
            search: e.target.value,
        });
    }

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFilter({
            ...filter,
            showSearch: filter.search
        });
        setLoadingFirst(true);
        try {

            await handlePaginate(
                1,
                {
                    search: filter.search,
                }
            )
        } finally {

            setLoadingFirst(false);
        }
    }

    return (
        <section className={'relative flex items-center flex-col w-full bg-white dark:bg-gray-900'}>
            <img src={BgMenu} className={'h-[550px] absolute w-full object-cover dark:opacity-60'} alt='Menu'/>
            <div className={'absolute inset-x-0 mx-auto w-full my-32'}>
                <h2 className={'sm:text-6xl text-2xl font-bold text-white text-center'}>Catalog Menu</h2>
                <p className={'text-white text-center mt-4 sm:text-2xl text-base'}>
                    Welcome to our Catalog Menu, where every dish is a carefully curated experience designed to delight
                    your senses.
                </p>
            </div>
            <div
                className={'bg-white dark:bg-gray-800 dark:border dark:border-gray-700 sm:p-10 p-5 rounded-2xl mb-10 z-10 w-[90%] mt-80'}>
                <h3 className={'font-bold text-3xl text-center mb-4 text-gray-900 dark:text-gray-100'}>
                    Discover Your Best Choices
                </h3>
                <form onSubmit={handleSearch}
                      className={'flex mx-auto items-center sm:w-1/2 justify-center border-1 my-10 rounded-full bg-gray-100 dark:bg-gray-700'}>
                    <input
                        className={'px-4 focus:outline-none py-3 w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300'}
                        onChange={handleChange}
                        placeholder={'Search ....'}
                        value={filter.search}
                    />
                    <button type="submit"
                            className={'btn-primary text-white p-1 rounded-full font-bold dark:bg-yellow-500 dark:text-gray-900'}>
                        <HiMiniMagnifyingGlass className={'text-4xl '}/>
                    </button>
                </form>
                <div
                    className={'flex mx-auto items-center sm:flex-row flex-col gap-6 justify-between  2xl:w-2/3 xl:w-3/4 lg:w-full'}>
                    <p className={'text-gray-700 dark:text-gray-300'}>
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
                <div
                    className={'lg:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-10 sm:gap-10 gap-5 grid mx-auto items-center justify-between  2xl:w-2/3 xl:w-3/4 lg:w-full'}>
                    {
                        loadingFirst ?
                            Array.from({length: 12}, (_, index) => (
                                <CardMenuSkeleton
                                    key={index}
                                />
                            )) :
                            totalData === 0 && !loading ?
                                <div className="sm:p-20 col-span-4 space-y-7 text-center">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">No menu
                                        found</h3>
                                </div> :
                                data.map((menu, index) => (
                                    <CardMenu
                                        key={index}
                                        id={menu.id}
                                        photo={`${menu.photo || DummyProduct}`}
                                        name={menu.name}
                                        rating={menu.rating}
                                    />
                                ))
                    }
                    {
                        !isMaxScroll &&
                        <div ref={refLoader}
                             className={'flex lg:col-span-4 md:col-end-3 col-span-2 flex-col justify-center items-center w-full'}
                        >
                            <div className="spinner mx-auto mb-4">
                            </div>
                            <p className={'text-gray-700 dark:text-gray-300'}>Load More ...</p>
                        </div>
                    }
                </div>
            </div>
        </section>
    )
}

export default MenuPage;