import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {Link, Outlet, useParams} from "react-router";
import CardListProductByCategory from "../../../component/ui/card/CardListProductByCategory.tsx";
import useMenu from "../../../hook/useMenu.ts";
import {useEffect, useState} from "react";
import Loading from "../../../component/ui/Loading.tsx";
import NotFoundPage from "../../404.tsx";

const ListProductByCategory = () => {
    const params = useParams<Readonly<{ id: string }>>()
    const [notFound, setNotFound] = useState(false);
    const [name, setName] = useState('');
    const {getMenuByCategory, data, loading} = useMenu();

    useEffect(() => {
        const fetchData = async () => {
            if (params.id) {
                const res = await getMenuByCategory(Number(params.id));
                if (res) {
                    setName(res.data.name);
                } else {
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
        }
        fetchData();
    }, []);

    if (notFound) {
        return <NotFoundPage/>;
    }

    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'Manage Categories'}
                             description={`you can organize and manage all categories available in your menu.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between'}>
                    <div className={'flex gap-20'}>
                        <h4 className={'text-xl font-semibold'}>
                            Category
                        </h4>
                        <h4 className={'text-xl'}>
                            {name}
                        </h4>
                    </div>
                    <div className={'gap-3 flex items-center'}>
                        <Link to={'/dashboard/manage-category/list-category'}
                              className={'btn-primary text-white px-4 py-2 rounded-lg'}>
                            Back
                        </Link>
                    </div>
                </div>
                <div className={'mt-10 grid grid-cols-4'}>
                    {
                        loading ?
                            <div className={'col-span-4'}>
                                <Loading/>
                            </div> :
                            data.length === 0 ?
                                <p className={'text-center text-2xl font-semibold col-span-4'}>No
                                    data menu found</p> :
                                data.map((menu, index) => (
                                    <CardListProductByCategory key={index} name={menu.name}
                                                               description={menu.description}
                                                               image={`${import.meta.env.VITE_APP_IMAGE_URL}/${menu.photo}`}/>
                                ))
                    }
                </div>
            </div>
            <Outlet/>
        </div>
    );
}

export default ListProductByCategory;