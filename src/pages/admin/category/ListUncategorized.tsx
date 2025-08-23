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
        // Handle the value change here
        const res = await setCategory({
            id,
            category_id: value.value
        })
        if (res) {
            handlePaginate(1, {search: ''}, true, "/api/admin/category/uncategorized")
        }
    }

    return (
        <div className={'mt-10 bg-white p-8 rounded-lg'}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-semibold'}>
                    Menu
                </h4>
            </div>
            {
                loading ?
                    <Loading/>
                    :
                    totalData === 0 ?
                        <div className={'text-center space-y-6 my-20'}>
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
                                                photo={`${import.meta.env.VITE_APP_IMAGE_URL}/${menu.photo}`}/>
                                        )
                                    })
                                }
                                <div className={'flex justify-end mt-10'}>
                                    <PaginationDashboard currentPage={page}
                                                         onPageChange={handlePaginate}
                                                         query={{search: ''}}
                                                         isCustom={true}
                                                         endpoint={'/api/admin/category/uncategorized'}
                                                         totalData={totalData}/>
                                </div>
                            </div>
                        </>
            }
        </div>
    );
}

export default ListUncategorizedPage;