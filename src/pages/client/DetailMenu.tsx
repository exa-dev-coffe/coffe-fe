import DummyProduct from "../../assets/images/dummyProduct.png";
import {formatCurrency} from "../../utils";
import CardMenu from "../../component/ui/card/CardMenu.tsx";
import useMenu from "../../hook/useMenu.ts";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import NotFoundPage from "../404.tsx";
import type {Menu, ResponseGetMenu} from "../../model/menu.ts";
import DetailMenuSkeleton from "../../component/ui/Skeleton/DetailMenuSkeleton.tsx";
import CardMenuSkeleton from "../../component/ui/Skeleton/CardMenuSkeleton.tsx";
import useAuthContext from "../../hook/useAuthContext.ts";
import RatingDetailMenu from "../../component/RatingDetailMenu.tsx";
import {CiCircleMinus, CiCirclePlus} from "react-icons/ci";

const DetailMenu = () => {

    const {getMenu} = useMenu()
    const params = useParams<Readonly<{ id: string }>>()
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        notes: '',
        amount: 1,
    });
    const auth = useAuthContext()
    const [notFound, setNotFound] = useState(false)
    const [showDescription, setShowDescription] = useState(true);
    const navigate = useNavigate()
    const [data, setData] = useState<Menu>({
        rating: 0,
        id: 0,
        name: '',
        price: 0,
        photo: '',
        category_id: 0,
        description: '',
        is_available: true,
    });
    const [dataSuggest, setDataSuggest] = useState<Menu[]>([]);

    useEffect(
        () => {
            const fetchData = async () => {
                try {
                    const [resDetail, resDataSuggest] = await Promise.all([
                        getMenu(true, Number(params.id)),
                        getMenu()
                    ]);
                    if (!resDetail) {
                        setNotFound(true);
                    } else {
                        setNotFound(false);
                        setData(resDetail as Menu);
                        const dataSuggest = resDataSuggest as ResponseGetMenu;
                        if (resDataSuggest && Array.isArray(dataSuggest.data)) {
                            const dataSuggestTemp = (dataSuggest.data).filter(item => item.id !== Number(params.id));
                            setDataSuggest(dataSuggestTemp);
                        } else {
                            setDataSuggest([]);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch menu details:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }, []
    )

    if (auth.auth.loading) {
        return null
    }

    if (notFound || (!data && !loading)) {
        return <NotFoundPage/>
    }

    return (
        <section className="container mx-auto my-10">
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Details
                </h4>
            </div>
            {
                loading ?
                    <DetailMenuSkeleton/> :
                    <>
                        <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                            <h4 className={'font-bold text-3xl'}>
                                {
                                    data.name
                                }
                            </h4>
                            <div className={'flex items-center text-2xl'}>
                                <RatingDetailMenu rating={data.rating}/>
                                <h5 className={'ms-4 text-xl'}>
                                    ({data.rating})
                                </h5>
                            </div>
                        </div>
                        <div className={'flex gap-5'}>
                            <div
                                className={'mt-10 shrink-0 w-96 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                                <img src={import.meta.env.VITE_APP_IMAGE_URL + `/${data.photo}`}
                                     className={'w-96 mx-auto rounded-2xl h-96 object-cover'}
                                     alt={data.name}/>
                            </div>
                            <div className={'mt-10 flex grow flex-col bg-white p-8 rounded-2xl'}>
                                <h3 className={'text-2xl font-bold'}>
                                    {data.name}
                                </h3>
                                <div className={'flex items-center gap-2 text-xl'}>
                                    <h5 className={'font-bold text-gray-700  text-xl'}>
                                        {formatCurrency(data.price)}
                                    </h5>
                                    |
                                    <p className={'text-gray-400'}>
                                        {
                                            data.is_available ? 'Stock tersedia' : 'Stock tidak tersedia'
                                        }
                                    </p>
                                </div>
                                {
                                    showDescription ?
                                        <p className={'text-gray-600 mt-8'}>
                                            {
                                                data.description
                                            }
                                        </p>
                                        : <>
                                            <div className={'mt-5'}>
                                                <label className={'text-gray-600 mt-8'}
                                                       htmlFor={'notes'}>
                                                    Notes
                                                    <textarea
                                                        className={'w-full h-32 p-4 border border-gray-300 rounded-lg mt-3 '}
                                                        placeholder={'Add your notes here...'}
                                                        value={form.notes}
                                                        id={"notes"}
                                                        onChange={(e) => setForm({
                                                            ...form,
                                                            notes: e.target.value
                                                        })}
                                                    />
                                                </label>
                                            </div>
                                            <div className={'mt-5 flex items-center justify-between'}>
                                                <h5>
                                                    Amount
                                                </h5>
                                                <div className={'flex  items-center gap-2 text-xl'}>
                                                    <button
                                                        className={'disabled:cursor-not-allowed cursor-pointer'}
                                                        disabled={form.amount <= 1}
                                                        onClick={() => setForm({
                                                            ...form,
                                                            amount: form.amount > 1 ? form.amount - 1 : 1
                                                        })}>

                                                        <CiCircleMinus
                                                        />
                                                    </button>
                                                    <span className={'text-gray-600'}>
                                                        {form.amount}
                                                    </span>
                                                    <button
                                                        className={'cursor-pointer'}
                                                        onClick={() => setForm({
                                                            ...form,
                                                            amount: form.amount + 1
                                                        })}
                                                    >

                                                        <CiCirclePlus
                                                        />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={'text-gray-600 my-5 flex items-center justify-between'}>
                                                <h5>
                                                    Total
                                                </h5>
                                                <h5 className={'font-bold text-xl'}>
                                                    {formatCurrency(data.price * form.amount)}
                                                </h5>
                                            </div>
                                        </>
                                }
                                <div className={'mt-auto ms-auto '}>
                                    <button onClick={() => {
                                        if (!auth.auth.isAuth) {
                                            return navigate('/login',)
                                        } else if (auth.auth.isAuth) {
                                            setShowDescription(!showDescription);

                                        }
                                    }} className={'btn-tertiary px-6 font-bold py-3 block   rounded-2xl'}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
            }
            <div className={'mt-10 '}>
                <h3 className={'text-xl font-bold'}>Suggested for You</h3>
            </div>
            <div className={'grid grid-cols-6 gap-10 mt-10 mb-20'}>
                {
                    loading ?
                        Array.from({length: 6}, (_, index) => (
                            <CardMenuSkeleton
                                key={index}
                            />
                        )) :
                        dataSuggest.length > 0 ? dataSuggest.slice(0, 6).map((menu, index) => (
                            <CardMenu
                                key={index}
                                id={menu.id}
                                photo={`${import.meta.env.VITE_APP_IMAGE_URL}/${menu.photo || DummyProduct}`}
                                name={menu.name}
                                rating={menu.rating}
                            />
                        )) : (
                            <div className="col-span-6 text-center">
                                <p className="text-gray-500">No suggestions available</p>
                            </div>
                        )
                }
            </div>
        </section>
    );
}

export default DetailMenu;