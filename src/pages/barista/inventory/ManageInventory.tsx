// ManageInventory.tsx
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import useDebounce from "../../../hook/useDebounce.ts";
import Modal from "../../../component/ui/Modal.tsx";
import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import Loading from "../../../component/ui/Loading.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import CardMenuInventory from "../../../component/ui/card/CardMenuInventory.tsx";

const ManageInventoryPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {getMenu, data, page, totalData, handlePaginate, loading, updateAvailableMenu} = useMenu()
    const searcDebounce = useDebounce(handlePaginate, 1000);

    useEffect(() => {
        getMenu()
    }, [])

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const showModalUpdate = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        searcDebounce(1, {search: e.target.value});
    }

    return (
        <div className={'container mx-auto px-4'}>
            <Modal title={'Confirm Update'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10 text-gray-900 dark:text-gray-100'}>
                    <h4 className={'sm:text-2xl text-base  font-semibold text-center mb-4'}>
                        Is this menu item still available in the kitchen??
                        Please verify before proceeding
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            async () => {
                                if (!selectedId) return;
                                await updateAvailableMenu(selectedId, true);
                                handleCloseModal();
                                handlePaginate(1, {search});
                            }
                        } className={'btn-primary text-white sm:px-10 px-4  font-semibold py-2 rounded-lg'}>
                            Yes, it's available
                        </button>
                        <button className={'btn-primary text-white sm:px-10 px-4  font-semibold py-2 rounded-lg'}
                                onClick={
                                    async () => {
                                        if (!selectedId) return;
                                        await updateAvailableMenu(selectedId, false);
                                        handleCloseModal();
                                        handlePaginate(1, {search});
                                    }
                                }>
                            No,it's out of stock
                        </button>
                    </div>
                </div>
            </Modal>
            <HeaderDashboard title={'Manage Catalog'}
                             description={`you can organize and manage all items available in your menu.`}/>
            <div
                className={'mt-10 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 text-gray-900 dark:text-gray-100 p-8 rounded-lg transition-colors'}>
                <div className={'flex sm:flex-row flex-col items-center gap-5 justify-between'}>
                    <h4 className={'text-xl font-semibold text-gray-900 dark:text-gray-100'}>
                        Menu
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input value={search} onChange={handleChange} placeholder={'Search'}
                                   className={'focus:ring-gray-300 border rounded-lg border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-400 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'}/>
                        </div>
                    </div>
                </div>
                {
                    loading ?
                        <Loading/>
                        :
                        totalData === 0 ?
                            <div className={'text-center space-y-6 my-20 text-gray-700 dark:text-gray-300'}>
                                No data found
                            </div>
                            :
                            <>
                                <div className={"mt-6 overflow-x-auto w-full"}>
                                    {data.map(item => (
                                            <CardMenuInventory key={item.id} isAvailable={item.isAvailable} id={item.id}
                                                               name={item.name} description={item.description}
                                                               showModalUpdate={showModalUpdate}
                                                               photo={item.photo} price={item.price} rating={item.rating}/>
                                        )
                                    )}
                                </div>
                                <div className={'flex justify-end mt-10'}>
                                    <PaginationDashboard currentPage={page}
                                                         onPageChange={handlePaginate}
                                                         query={{search}}
                                                         totalData={totalData}/>
                                </div>
                            </>
                }
            </div>
        </div>
    );
}

export default ManageInventoryPage;