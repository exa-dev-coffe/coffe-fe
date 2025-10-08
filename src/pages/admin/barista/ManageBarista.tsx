import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import Modal from "../../../component/ui/Modal.tsx";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import useDebounce from "../../../hook/useDebounce.ts";
import Input from "../../../component/ui/form/Input.tsx";
import useBarista from "../../../hook/useBarista.ts";
import CardBarista from "../../../component/ui/card/CardBarista.tsx";
import DummyPhoto from '../../../assets/images/dummyProfile.png';

const ManageBaristaPage = () => {

    const [showModal, setShowModal] = useState(false);
    const [openTab, setOpenTab] = useState({
        add: false,
    });
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const {getBarista, data, deleteBarista, page, error, addBarista, totalData, handlePaginate, loading} = useBarista()

    const searcDebounce = useDebounce(handlePaginate, 1000);

    useEffect(() => {
        getBarista()
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
        const res = await addBarista(formData);
        if (res) {
            setOpenTab({add: false});
            setFormData({
                email: '',
                password: '',
                fullName: ''
            });
            handlePaginate(1, {search});
        }
    }

    return (
        <div className={'container mx-auto px-4'}>
            <Modal title={'Confirm Delete'} show={showModal} size={'sm'} handleClose={handleCloseModal}>
                <div className={'p-10'}>
                    <h4 className={'sm:text-2xl text-lg  font-semibold text-center mb-4'}>
                        Are you sure you want to
                        delete this barista?
                    </h4>
                    <div className={'flex mt-14 justify-center gap-4'}>
                        <button onClick={
                            async () => {
                                if (!selectedId) return;
                                await deleteBarista(selectedId);
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
            <HeaderDashboard title={'Manage Barista'}
                             description={`You can organize and manage all your baristas.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex gap-5 items-center flex-col sm:flex-row justify-between'}>
                    <h4 className={'text-xl font-semibold'}>
                        Barista
                    </h4>
                    <div className={'gap-3 flex items-center'}>
                        <div>
                            <input value={search} name={'search'} onChange={handleChange} placeholder={'Search'}
                                   className={'focus:ring-gray-300 border rounded-lg border-gray-300 placeholder-gray-400 p-2'}/>
                        </div>
                        {
                            openTab.add ?
                                <button onClick={() => setOpenTab({
                                    add: false,
                                })} className={'btn-danger text-white px-4 py-2 rounded-lg'}>
                                    Close
                                </button>
                                :
                                <button onClick={() => setOpenTab({
                                    add: true,
                                })} className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                                    Add
                                </button>
                        }
                    </div>
                </div>
                <div
                    className={`bg-[#FAFAFA]  overflow-hidden px-8 transition-all duration-500  ${openTab.add ? 'my-10 h-[570px]' : 'h-0 '}`}>
                    <div className={'border-b-2 pb-4 mt-4 border-b-[#E5E7EB]'}>
                        <h4 className={'sm:text-xl text-sm '}>
                            Add Barista
                        </h4>
                    </div>
                    <form onSubmit={handleSubmit} className={'sm:w-1/2 lg:w-1/3 mt-10 space-y-6 mx-auto'}>
                        <Input disabled={false} required={true} value={formData.fullName} label={"Full Name"}
                               onChange={handleChange}
                               type={'text'} name={'fullName'}
                               error={error.fullName}
                               placeholder={'Full Name'}/>
                        <Input disabled={false} required={true} value={formData.email} label={"Email"}
                               onChange={handleChange}
                               type={'email'} name={'email'}
                               error={error.email}
                               placeholder={'Email'}/>
                        <Input disabled={false} required={true} value={formData.password} label={"Password"}
                               onChange={handleChange}
                               type={'password'} name={'password'}
                               error={error.password}
                               placeholder={'Password'}/>
                        <div className={'flex justify-center gap-5 sm:gap-10  mt-10'}>
                            <button type={'submit'}
                                    className={'btn-primary text-white sm:px-10 px-5  w-24 sm:w-32 font-semibold py-2 rounded-lg'}>
                                Add
                            </button>
                            <button type={'button'}
                                    onClick={() => setOpenTab({add: false})}
                                    className={'btn-danger   text-white sm:px-10 px-5  w-24 sm:w-32 font-semibold py-2 rounded-lg'}>
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
                                <div className={"mt-6 overflow-x-auto w-full"}>
                                    {data.map((item, index) => (
                                            <CardBarista id={Number(item.user_id)}
                                                         photo={item.photo ? `${import.meta.env.VITE_APP_IMAGE_URL}/${item.photo}` : DummyPhoto}
                                                         full_name={item.full_name}
                                                         key={index}
                                                         email={item.email} showModalDelete={showModalDelete}/>
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

export default ManageBaristaPage;