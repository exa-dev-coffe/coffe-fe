import {useEffect, useState} from "react";
import useCartContext from "../../hook/useCartContext.ts";
import useTable from "../../hook/useTable.ts";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import useOrder from "../../hook/useOrder.ts";
import DummyProduct from "../../assets/images/dummyProduct.png";
import type {BodyOrder} from "../../model/order.ts";
import {formatCurrency, formatDateTimeShortString} from "../../utils";

const TransactionPage = () => {

    const [formData, setFormData] = useState<{
        name: string;
        table: { value: number; label: string } | null;
        pin: string;
    }>({
        name: '',
        pin: '',
        table: {value: 0, label: ''}
    })
    const [selectedAll, setSelectedAll] = useState(false);
    const {getTableOptions, options, setOptions} = useTable()
    const notification = useNotificationContext()
    const [showModal, setShowModal] = useState(false);
    const cart = useCartContext()
    const {handleCheckout} = useOrder();
    const total = cart.cart.datas.reduce((acc, item) => {
        if (item.checked) {
            return acc + (item.price * item.amount);
        }
        return acc;
    }, 0);

    useEffect(() => {
        let isAllSelected = false
        if (cart.cart.datas.length > 0) {
            isAllSelected = cart.cart.datas.every(item => item.checked);
        }
        setSelectedAll(isAllSelected);
    }, [cart.cart.datas]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getTableOptions()
            if (res && res.total_data > 0) {
                const dataFiltered = res.data.filter(item => item.id !== cart.cart.table_id);
                setOptions(dataFiltered.map(item => ({
                    value: item.id,
                    label: item.name
                })));
            }
            setFormData({
                name: cart.cart.order_for,
                pin: '',
                table: {value: cart.cart.table_id, label: cart.cart.table_name}
            })
        }
        fetchData()
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        cart.setCart({
            ...cart.cart,
            order_for: value,
        })
    };

    const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {value, name} = e.target;
        const id = parseInt(name.split('-')[1], 10);
        cart.setCart({
            ...cart.cart,
            datas: cart.cart.datas.map(item => {
                if (item.id === id) {
                    return {...item, notes: value};
                }
                return item;
            })
        })
    };

    const handleChangeCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked, name} = e.target;
        const id = parseInt(name.split('-')[1], 10);
        const dataUpdate = cart.cart.datas.map(item => {
            if (item.id === id) {
                return {...item, checked: checked};
            }
            return item;
        });
        cart.setCart({
            ...cart.cart,
            datas: dataUpdate
        });
        setSelectedAll(dataUpdate.every(item => item.checked));
    };

    const handleChangeAmount = (data: { increment: boolean; id: number }) => {
        const {increment, id} = data;
        const dataUpdate = cart.cart.datas.map(item => {
            if (item.id === id) {
                const newAmount = increment ? item.amount + 1 : Math.max(1, item.amount - 1);
                return {...item, amount: newAmount};
            }
            return item;
        });
        cart.setCart({
            ...cart.cart,
            datas: dataUpdate
        });
    };

    const handleChangeTable = (value: { value: number; label: string } | null) => {
        setFormData(prevState => ({
            ...prevState,
            table: value
        }));
        cart.setCart({
            ...cart.cart,
            table_id: value ? value.value : 0,
            table_name: value ? value.label : ''
        })
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectedAll(isChecked);
        const dataUpdate = cart.cart.datas.map(item => ({
            ...item,
            checked: isChecked
        }));
        cart.setCart({
            ...cart.cart,
            datas: dataUpdate
        })
    };

    const handleShowModalCheckout = () => {
        if (formData.name.trim() === '') {
            notification.setNotification({
                type: 'error',
                message: 'Please enter a name for the order',
                isShow: true,
                duration: 1000,
                mode: 'client',
                size: 'sm'
            })
            return;
        }
        if (!formData.table || formData.table.value === 0) {
            notification.setNotification({
                type: 'error',
                message: 'Please select a table',
                isShow: true,
                duration: 1000,
                mode: 'client',
                size: 'sm'
            })
            return;
        }
        setFormData({
            ...formData,
            pin: ''
        })
        const selectedItems = cart.cart.datas.filter(item => item.checked);
        if (selectedItems.length === 0) {
            notification.setNotification({
                type: 'error',
                message: 'Please select at least one item to checkout',
                isShow: true,
                duration: 1000,
                mode: 'client',
                size: 'sm'
            })
            return;
        }
        setShowModal(true)
    }

    const handleSubmitCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle top-up logic here
        if (formData.pin.trim() === '' || !formData.table || formData.table.value === 0) {
            return;
        }
        const payload: BodyOrder = {
            pin: Number(formData.pin),
            order_for: formData.name,
            table_id: formData.table.value,
            datas: cart.cart.datas.filter(item => item.checked).map(item => ({
                menu_id: item.id,
                qty: item.amount,
                notes: item.notes
            }))
        }
        const res = await handleCheckout(payload)
        if (res) {
            cart.setCart({
                table_id: 0,
                table_name: '',
                order_for: cart.cart.order_for,
                datas: cart.cart.datas.filter(item => !item.checked),
            })
            setFormData({
                name: cart.cart.order_for,
                pin: '',
                table: {value: 0, label: ''}
            })
            setShowModal(false);

        }
    };

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
                    Transactions
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-5xl'}>
                    Transactions
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl '}>
                <div className={'flex justify-between'}>
                    <h4 className={'text-xl font-bold'}>
                        Table
                    </h4>
                    <p>
                        {formatDateTimeShortString(new Date().toISOString())}
                    </p>
                </div>
                <div className={'flex justify-between'}>
                    <div className={'flex justify-start gap-10'}>
                        <div>
                            <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                            <h6 className={'text-xl mt-4 w-64 truncate'}>
                                Nama Product
                            </h6>
                        </div>
                        <div>
                            <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                            <h6 className={'text-xl mt-4 w-64 truncate'}>
                                Nama Product ajiasiaiaihai asiahsasia ashiasiai aiias
                            </h6>
                        </div>
                        <div>
                            <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                            <h6 className={'text-xl mt-4 w-64 truncate'}>
                                Nama Product
                            </h6>
                        </div>
                        <div>
                            <img src={DummyProduct} className={'w-64 h-64 object-cover rounded-xl'} alt={'product'}/>
                            <h6 className={'text-xl mt-4 w-64 truncate'}>
                                Nama Product
                            </h6>
                        </div>
                    </div>
                    <div className={'text-end flex flex-col justify-between'}>
                        <div>

                            <h5 className={'font-bold text-xl mt-7 mb-3'}>
                                {formatCurrency(1000)}
                            </h5>
                            <p>
                                5 Menu
                            </p>
                        </div>
                        <h5 className={'text-xl text-[#F9A825] font-bold mt-7 mb-3'}>
                            {/*${status === 1 ? `text-[#F9A825]` : status === 3 ? `text-[#F44336]` : status === 2 ? `text-[#47DC53]` : ``}>*/}
                            Order Confirmed
                        </h5>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TransactionPage;
