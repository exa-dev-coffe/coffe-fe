import {Link} from "react-router";
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import useDebounce from "../../../hook/useDebounce.ts";
import Loading from "../../../component/ui/Loading.tsx";
import PaginationDashboard from "../../../component/PaginationDashboard.tsx";
import CardListCategory from "../../../component/ui/card/CardListCategory.tsx";
import Input from "../../../component/ui/form/Input.tsx";

const ListCategoryPage = () => {

    const [showModal, setShowModal] = useState(false);
    const [openTab, setOpenTab] = useState({
        add: true,
    });
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Add your form submission logic here
        // For example, you might want to call an API to add a new category
        console.log("Form submitted with name:", search);
        setSearch(''); // Clear the input after submission
    }

    return (

        <div className={'mt-10 bg-white p-8 rounded-lg'}>
            <div className={'flex justify-between'}>
                <h4 className={'text-xl font-semibold'}>
                    Categories
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
            <div className={'bg-[#FAFAFA] my-10 py-4 px-8 '}>
                <div className={'border-b-2 pb-4 border-b-[#E5E7EB]'}>
                    <h4 className={'text-xl '}>
                        {
                            openTab.add ? 'Add Categories' : null
                        }
                    </h4>
                </div>
                <form onSubmit={handleSubmit} className={'w-1/3   mt-10 mx-auto'}>
                    <Input disabled={false} required={true} value={search} label={"Name"} onChange={handleChange}
                           type={'text'} name={'name'}
                           placeholder={'Category Name'}/>
                    <div className={'flex justify-center gap-10   mt-10'}>
                        <button type={'submit'}
                                className={'btn-primary text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                            Add
                        </button>
                        <button type={'button'}
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
                                {data.map(item => (
                                        <CardListCategory key={item.id} id={item.id}
                                                          name={item.name}
                                                          showModalDelete={showModalDelete}
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
        </div>
    );
}

export default ListCategoryPage;