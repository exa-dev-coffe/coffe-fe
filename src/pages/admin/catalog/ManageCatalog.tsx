import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import CardCatalog from "../../../component/ui/card/CardCatalog.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import Modal from "../../../component/ui/Modal.tsx";
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import {Link} from "react-router";

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
        <div className={'container mx-auto'}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10'}>
                    <h4 className={'text-2xl  font-semibold text-center mb-4'}>
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
                             description={`you can organize and manage all items available in your menu.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <h4 className={'text-xl font-semibold'}>
                        Menu
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input value={search} onChange={handleChange} placeholder={'Search'}
                                   className={'focus:ring-gray-300 border rounded-lg border-gray-300 placeholder-gray-400 p-2'}/>
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
                            <div className={'text-center space-y-6 my-20'}>
                                No data found
                            </div>
                            :
                            <>
                                <div className={"mt-6"}>
                                    {data.map(item => (
                                            <CardCatalog key={item.id} is_available={item.is_available} id={item.id}
                                                         name={item.name} description={item.description}
                                                         showModalDelete={showModalDelete}
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

export default ManageCatalogPage;