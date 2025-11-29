import {useEffect} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useCategory from "../../../hook/useCategory.ts";
import CardCatalogUncategorized from "../../../component/ui/card/CardCatalogUncategorized.tsx";
import useMenu from "../../../hook/useMenu.ts";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";

const ListUncategorizedPage = () => {

    const {
        getCategoryOptions,
        options,
        setCategory
    } = useCategory()
    const {getMenuUncategorized, loading, page, handlePaginate, totalData, data} = useMenu()

    useEffect(() => {
        getCategoryOptions()
        getMenuUncategorized()
    }, [])

    const handleUpdateCategory = async (id: number, value: { value: number; label: string }) => {
        const res = await setCategory({
            id,
            categoryId: value.value
        })
        if (res) {
            handlePaginate(1, {search: ''}, "/api/1.0/menus/uncategorized")
        }
    }

    return (
        <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-lg border border-slate-100 dark:border-slate-700'}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                    Menu
                </h4>
            </div>
            {
                loading ?
                    <Loading/>
                    :
                    totalData === 0 ?
                        <div className={'text-center space-y-6 my-20 text-slate-800 dark:text-slate-200'}>
                            No data found
                        </div>
                        :
                        <>
                            <div className={"mt-6 overflow-x-auto w-full"}>
                                {
                                    data.map((menu, index) => {
                                        return (
                                            <CardCatalogUncategorized
                                                key={index}
                                                id={menu.id}
                                                name={menu.name}
                                                description={menu.description}
                                                optionsDefault={options}
                                                handleUpdateCategory={handleUpdateCategory}
                                                photo={`${menu.photo}`}/>
                                        )
                                    })
                                }
                                <div className={'flex justify-end mt-10'}>
                                    <PaginationDashboard currentPage={page}
                                                         onPageChange={handlePaginate}
                                                         query={{search: ''}}
                                                         endpoint={'/api/1.0/menus/uncategorized'}
                                                         totalData={totalData}/>
                                </div>
                            </div>
                        </>
            }
        </div>
    );
}

export default ListUncategorizedPage;