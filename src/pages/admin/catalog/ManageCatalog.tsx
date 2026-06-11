import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import CardCatalog from "../../../component/ui/card/CardCatalog.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import Modal from "../../../component/ui/Modal.tsx";
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import {Link} from "react-router";
import Card from "../../../component/ui/Card.tsx";

const ManageCatalogPage = () => {

    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {getMenu, data, deleteMenu, page, totalData, handlePaginate, loading} = useMenu()
    const searcDebounce = useDebounce(handlePaginate, 1000);

    useEffect(() => {
        getMenu()
    }, [])

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const showModalDelete = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        searcDebounce(1, {search: e.target.value});
    }

    return (
        <div className={'container mx-auto px-4'}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10 bg-white dark:bg-gray-900 rounded-md text-slate-800 dark:text-slate-100'}>
                    <h4 className={'sm:text-2xl text-base font-semibold text-center mb-4'}>
                        Are you sure you want to remove
                        this item from the menu?
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            async () => {
                                if (!selectedId) return;
                                await deleteMenu(selectedId);
                                handleCloseModal();
                                handlePaginate(1, {search});
                            }
                        } className={'btn-primary text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                            Yes
                        </button>
                        <button className={'btn-danger text-white px-10 w-32 font-semibold py-2 rounded-lg'}
                                onClick={handleCloseModal}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            <HeaderDashboard title={'Manage Catalog'}
                             description={'Organize and manage all items available in your menu.'}/>
            <Card variant="dashboard" className="mt-10">
                <div className={'flex sm:flex-row flex-col items-center gap-5 justify-between'}>
                    <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                        Menu
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input
                                value={search}
                                onChange={handleChange}
                                placeholder={'Search...'}
                                aria-label="Search menu"
                                className={'focus:ring-gray-300 dark:focus:ring-slate-600 border rounded-lg border-gray-300 dark:border-slate-600 placeholder-gray-400 dark:placeholder-gray-400 p-2 bg-white dark:bg-gray-700 text-slate-800 dark:text-slate-100 focus-ring'}
                            />
                        </div>
                        <Link to={'add-catalog'} className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                            Add
                        </Link>
                    </div>
                </div>
                {
                    loading ?
                        <Loading/>
                        :
                        totalData === 0 ?
                            <div className={'text-center space-y-4 my-20 text-slate-800 dark:text-slate-100'}>
                                <p className="text-lg font-medium">No menu items found</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Add your first menu item to get started.</p>
                            </div>
                            :
                            <>
                                <div className={"mt-6 overflow-x-auto w-full"}>
                                    {data.map((item, index) => (
                                            <CardCatalog key={index}
                                                         showModalDelete={showModalDelete}
                                                         {...item}
                                            />
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
            </Card>
        </div>
    );
}

export default ManageCatalogPage;