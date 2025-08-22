import {useEffect, useState} from "react";
import {Link} from "react-router";
import {FaPlus} from "react-icons/fa";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {CiUser} from "react-icons/ci";
import DropDownIcon from "../../component/ui/form/DropDownIcon.tsx";
import CheckBox from "../../component/ui/form/CheckBox.tsx";
import {formatCurrency} from "../../utils";
import useCartContext from "../../hook/useCartContext.ts";
import CardCart from "../../component/ui/card/CardCart.tsx";
import useTable from "../../hook/useTable.ts";
import useNotificationContext from "../../hook/useNotificationContext.ts";
import Input from "../../component/ui/form/Input.tsx";
import Modal from "../../component/ui/Modal.tsx";
import useOrder from "../../hook/useOrder.ts";
import type {BodyOrder} from "../../model/order.ts";

const CartPage = () => {

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
            <Modal size={'md'} title={'Checkout'} show={showModal} handleClose={() => setShowModal(false)}>
                <div className="p-10">
                    <form onSubmit={handleSubmitCheckout}>
                        <Input type={'number'}
                               name={'pin'}
                               label={'Pin'}
                               placeholder={'Enter your pin'}
                               required={true}
                               onChange={handleChange}
                               value={formData.pin}
                        />
                        <div className="mt-10">
                            <button type="submit"
                                    className="w-full btn-primary text-white py-3 px-7 rounded-lg cursor-pointer">
                                Checkout
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Cart
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-5xl'}>
                    Cart
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl '}>
                <div className={'flex justify-between items-center'}>
                    <h4 className={'font-bold mb-10 text-3xl'}>
                        Diskusi Coffe
                    </h4>
                    <Link to={'/menu'} className={'text-[#306a62] font-bold text-base flex items-center gap-2'}>
                        <FaPlus/>
                        Add Menu
                    </Link>
                </div>
                <div className={'flex justify-between items-center'}>
                    <InputIcon icon={<CiUser/>} onChange={handleChange} error={''} value={formData.name}
                               type={'text'} name={'name'} placeholder={'Name'} label={'Order For'}
                               required={true}/>
                    <div className={'w-96'}>
                        <DropDownIcon placeholder={'Select Table'} label={'Table'}
                                      options={options} icon={<CiUser/>}
                                      name={'table'}
                                      value={formData.table}
                                      setValue={handleChangeTable}
                                      setOptions={setOptions}/>
                    </div>
                </div>
                <div className={'my-10'}>
                    <CheckBox name={"select all"} value={selectedAll} onChange={handleSelectAll} label={'Select All'}/>
                </div>
                <div className={'grid grid-cols-3 my-10 gap-10'}>
                    {
                        cart.cart.datas.map((item, index) => (
                            <CardCart handleChangeNotes={handleChangeNotes} handleChangeCheckBox={handleChangeCheckBox}
                                      handleChangeAmount={handleChangeAmount} {...item}
                                      photo={`${import.meta.env.VITE_APP_IMAGE_URL}/${item.photo}`}
                                      key={index}/>
                        ))
                    }
                </div>
                <div className={'flex mt-10 justify-end gap-4'}>
                    <button
                        onClick={handleShowModalCheckout}
                        className={'btn-tertiary items-center flex justify-between px-6 font-bold py-3 w-full max-w-lg  rounded-2xl '}>
                        Checkout
                        <span>
                            {formatCurrency(total)}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default CartPage;
