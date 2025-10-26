import DummyProduct from "../../assets/images/dummyProduct.png";
import {formatCurrency} from "../../utils";
import CardMenu from "../../component/ui/card/CardMenu.tsx";
import useMenu from "../../hook/useMenu.ts";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import NotFoundPage from "../404.tsx";
import type {Menu, ResponseGetMenuPagination} from "../../model/menu.ts";
import DetailMenuSkeleton from "../../component/ui/Skeleton/DetailMenuSkeleton.tsx";
import CardMenuSkeleton from "../../component/ui/Skeleton/CardMenuSkeleton.tsx";
import useAuthContext from "../../hook/useAuthContext.ts";
import RatingDetailMenu from "../../component/RatingDetailMenu.tsx";
import {CiCircleMinus, CiCirclePlus} from "react-icons/ci";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import useCartContext from "../../hook/useCartContext.ts";

const DetailMenu = () => {

    const {getMenuById, handlePaginate} = useMenu()
    const params = useParams<Readonly<{ id: string }>>()
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        notes: '',
        amount: 1,
    });
    const auth = useAuthContext()
    const notification = useNotificationContext()
    const cart = useCartContext()
    const [notFound, setNotFound] = useState(false)
    const [showDescription, setShowDescription] = useState(true);
    const navigate = useNavigate()
    const [data, setData] = useState<Menu>({
        rating: 0,
        id: 0,
        name: '',
        price: 0,
        photo: '',
        categoryId: 0,
        description: '',
        isAvailable: true,
        categoryName: '',
    });
    const [dataSuggest, setDataSuggest] = useState<Menu[]>([]);

    useEffect(
        () => {
            const fetchData = async () => {
                try {
                    const resDetail = await getMenuById(Number(params.id))
                    if (!resDetail) {
                        setNotFound(true);
                    } else {
                        setNotFound(false);
                        setData(resDetail);
                        const resDataSuggest = await handlePaginate(1, {
                            category_id: resDetail.categoryId,
                            search: '',
                        });
                        const dataSuggest = resDataSuggest as ResponseGetMenuPagination;
                        if (resDataSuggest && Array.isArray(dataSuggest.data)) {
                            const dataSuggestTemp = (dataSuggest.data).filter(item => item.id !== Number(params.id));
                            setDataSuggest(dataSuggestTemp);
                        } else {
                            setDataSuggest([]);
                        }
                    }
                } finally {
                    setLoading(false);
                    setShowDescription(true);
                    const cartData = cart.cart.datas.find(item => item.id === Number(params.id));
                    if (cartData) {
                        setForm({
                            notes: cartData.notes || '',
                            amount: cartData.amount || 1,
                        });
                    } else {
                        setForm({
                            notes: '',
                            amount: 1,
                        });
                    }
                }
            };
            fetchData();
        }, [params.id]
    )

    const handleAddToCart = () => {
        if (!auth.isAuth) {
            notification.setNotification(
                {
                    type: 'error',
                    message: 'You must login to add items to the cart',
                    duration: 3000,
                    size: "sm",
                    isShow: true,
                    mode: 'client'
                }
            );
            return navigate('/login');
        }
        const isAlreadyInCart = cart.cart.datas.some(item => item.id === data.id);
        if (isAlreadyInCart) {
            const updatedCart = cart.cart.datas.map(item => {
                if (item.id === data.id) {
                    return {
                        ...item,
                        amount: form.amount,
                        notes: form.notes,
                    };
                }
                return item;
            });
            cart.setCart({
                ...cart.cart,
                datas: updatedCart
            });
            notification.setNotification(
                {
                    type: 'success',
                    message: `Successfully update item in cart`,
                    duration: 1000,
                    size: "sm",
                    isShow: true,
                    mode: 'client'
                }
            )
        } else {
            const newData = [
                ...cart.cart.datas,
                {
                    amount: form.amount,
                    id: data.id,
                    nameProduct: data.name,
                    price: data.price,
                    photo: data.photo,
                    checked: true,
                    notes: form.notes,
                }
            ]
            cart.setCart({
                ...cart.cart,
                datas: newData
            })
            notification.setNotification(
                {
                    type: 'success',
                    message: `Successfully add to cart`,
                    duration: 1000,
                    size: "sm",
                    isShow: true,
                    mode: 'client'
                }
            )
        }
    }

    if (auth.loading) {
        return null
    }

    if (notFound || (!data && !loading)) {
        return <NotFoundPage/>
    }

    return (
        <section className="container mx-auto my-10 px-4">
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
                        <div
                            className={'mt-10 bg-white p-8 rounded-2xl flex sm:flex-row flex-col gap-5 justify-between items-center'}>
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
                        <div className={'flex md:flex-row flex-col gap-5'}>
                            <div
                                className={'mt-10 shrink-0 md:w-96 w-full mx-auto bg-white p-8 rounded-2xl flex justify-between items-center'}>
                                <img src={data.photo}
                                     className={'w-96 mx-auto rounded-2xl h-96 object-cover'}
                                     alt={data.name}/>
                            </div>
                            <div className={'mt-10 flex grow flex-col gap-10 bg-white p-8 rounded-2xl'}>
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
                                            data.isAvailable ? 'Stock tersedia' : 'Stock tidak tersedia'
                                        }
                                    </p>
                                </div>
                                {
                                    showDescription ?
                                        <p className={'text-gray-600 '}>
                                            {
                                                data.description
                                            }
                                        </p>
                                        : <>
                                            <div className={'mt-5'}>
                                                <label className={'text-gray-600 '}
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
                                <div className={`mt-auto ms-auto ${!showDescription && 'w-full'}`}>
                                    {
                                        data.isAvailable ?
                                            <button onClick={() => {
                                                if (!auth.isAuth) {
                                                    return navigate('/login',)
                                                } else if (auth.isAuth) {
                                                    setShowDescription(!showDescription);
                                                    if (!showDescription) {
                                                        handleAddToCart()
                                                    }
                                                }
                                            }}
                                                    className={`btn-tertiary px-6 font-bold py-3 block  rounded-2xl  ${!showDescription && 'w-full'}`}>
                                                Add to Cart
                                            </button>
                                            : null
                                    }
                                </div>
                            </div>
                        </div>
                    </>
            }
            <div className={'mt-10 '}>
                <h3 className={'text-xl font-bold'}>Suggested for You</h3>
            </div>
            <div className={'grid 2xl:grid-cols-6 sm:grid-cols-3 grid-cols-2 gap-10 mt-10 mb-20'}>
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
                                photo={`${menu.photo || DummyProduct}`}
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