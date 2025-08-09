import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import Modal from "../../../component/ui/Modal.tsx";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import Input from "../../../component/ui/form/Input.tsx";
import CardTable from "../../../component/ui/card/CardTable.tsx";
import useTable from "../../../hook/useTable.ts";

const ManageTablesPage = () => {

    const [showModal, setShowModal] = useState(false);
    const [openTab, setOpenTab] = useState({
        add: false,
        edit: false
    });
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        name: '',
    });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {
        getTable,
        data,
        deleteTable,
        page,
        error,
        updateTable,
        addTable,
        totalData,
        handlePaginate,
        loading
    } = useTable()


    const searcDebounce = useDebounce(handlePaginate, 1000);

    useEffect(() => {
        getTable()
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
                [e.target.name]: e.target.value
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (openTab.edit) {
            if (!selectedId) return;
            const dataTemp = {
                name: formData.name,
                id: selectedId
            }
            const res = await updateTable(dataTemp);
            if (res) {
                setOpenTab({add: false, edit: false});
                setFormData({
                    name: ''
                });
                handlePaginate(1, {search});
            }
            return;
        }
        const res = await addTable(formData);
        if (res) {
            setOpenTab({add: false, edit: false});
            setFormData({
                name: ''
            });
            handlePaginate(1, {search});
        }
    }

    const showTabUpdate = (id: number) => {
        const dataTemp = data.find(item => item.id === id);
        if (dataTemp) {
            setFormData({
                name: dataTemp.name
            });
            setSelectedId(id);
            setOpenTab({
                add: false,
                edit: true
            });
        }
    }

    return (
        <div className={'container mx-auto'}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10'}>
                    <h4 className={'text-2xl  font-semibold text-center mb-4'}>
                        Are you sure you want to
                        delete this barista?
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            async () => {
                                if (!selectedId) return;
                                await deleteTable(selectedId);
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
            <HeaderDashboard title={'Manage Table'}
                             description={`You can organize and manage all your tables.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <h4 className={'text-xl font-semibold'}>
                        Tables
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input value={search} name={'search'} onChange={handleChange} placeholder={'Search'}
                                   className={'focus:ring-gray-300 border rounded-lg border-gray-300 placeholder-gray-400 p-2'}/>
                        </div>
                        {
                            (openTab.add || openTab.edit) ?
                                <button onClick={() => {
                                    setFormData({
                                        name: ''
                                    });
                                    setOpenTab({
                                        add: false,
                                        edit: false
                                    })
                                }} className={'btn-danger text-white px-4 py-2 rounded-lg'}>
                                    Close
                                </button>
                                :
                                <button onClick={() => setOpenTab({
                                    add: true,
                                    edit: false
                                })} className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                                    Add
                                </button>
                        }
                    </div>
                </div>
                <div
                    className={`bg-[#FAFAFA]  overflow-hidden px-8 transition-all duration-500  ${(openTab.add || openTab.edit) ? 'my-10 h-80' : 'h-0 '}`}>
                    <div className={'border-b-2 pb-4 mt-4 border-b-[#E5E7EB]'}>
                        <h4 className={'text-xl '}>
                            {
                                openTab.add ? 'Add Table' : openTab.edit ? 'Edit Table' : ''
                            }
                        </h4>
                    </div>
                    <form onSubmit={handleSubmit} className={'w-1/3 mt-10 space-y-6 mx-auto'}>
                        <Input disabled={false} required={true} value={formData.name} label={"Name"}
                               onChange={handleChange}
                               type={'text'} name={'name'}
                               error={error.name}
                               placeholder={'Name'}/>
                        <div className={'flex justify-center gap-10   mt-10'}>
                            <button type={'submit'}
                                    className={'btn-primary text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                                {
                                    openTab.add ? 'Add' : openTab.edit ? 'Update' : 'submit'
                                }
                            </button>
                            <button type={'button'}
                                    onClick={() => {
                                        setFormData({
                                            name: ''
                                        });
                                        setOpenTab({add: false, edit: false})
                                    }}
                                    className={'btn-danger   text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                                Cancel
                            </button>
                        </div>
                    </form>
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
                                    {data.map((item, index) => (
                                            <CardTable id={Number(item.id)} key={index} name={item.name}
                                                       showModalDelete={showModalDelete} showTabUpdate={showTabUpdate}
                                                       updated_at={item.updated_at}/>
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

export default ManageTablesPage;