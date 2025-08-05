import {useEffect, useState} from "react";
import useDebounce from "../../../hook/useDebounce.ts";
import Loading from "../../../component/ui/Loading.tsx";
import Modal from "../../../component/ui/Modal.tsx";
import useCategory from "../../../hook/useCategory.ts";
import CardCatalogUncategorized from "../../../component/ui/card/CardCatalogUncategorized.tsx";
import DummyProduct from "../../../assets/images/dummyProduct.png";


const ListUncategorizedPage = () => {

    const [showModal, setShowModal] = useState(false);
    const [openTab, setOpenTab] = useState({
        add: false,
    });
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        name: ''
    });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {
        deleteCategory,
        data,
        addCategory,
        error,
        getCategory,
        page,
        totalData,
        handlePaginate,
        loading
    } = useCategory()
    const searcDebounce = useDebounce(handlePaginate, 1000);

    useEffect(() => {
        getCategory()
    }, [])

    const handleCloseModal = () => {
        setShowModal(false);
    }

    const showModalDelete = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'search') {
            setSearch(e.target.value);
            searcDebounce(1, {search: e.target.value});
        } else {
            setFormData({
                ...formData,
                name: e.target.value
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await addCategory(formData)
        if (res) {
            setFormData({
                name: ''
            });
            setOpenTab({
                add: false,
            });
            handlePaginate(1, {search});
        } else {
            console.warn('Failed to add category');
        }
    }

    return (

        <div className={'mt-10 bg-white p-8 rounded-lg'}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10'}>
                    <h4 className={'text-2xl  font-semibold text-center mb-4'}>
                        Are you sure you want to remove
                        this category?
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            async () => {
                                if (!selectedId) return;
                                await deleteCategory(selectedId);
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
                            <div className={"mt-6"}>
                                <div><CardCatalogUncategorized id={1} name={"asas"} description={"lerjejr"}
                                                               photo={DummyProduct}/>
                                </div>
                            </div>
                        </>
            }
        </div>
    );
}

export default ListUncategorizedPage;