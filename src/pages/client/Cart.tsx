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
import PageHeader from "../../component/PageHeader.tsx";
import Card from "../../component/ui/Card.tsx";

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
    const [loadingCheckout, setLoadingCheckout] = useState(false);
    const cart = useCartContext()
    const {handleCheckout} = useOrder();
    const total = cart.datas.reduce((acc, item) => {
        if (item.checked) {
            return acc + (item.price * item.amount);
        }
        return acc;
    }, 0);

    useEffect(() => {
        let isAllSelected = false
        if (cart.datas.length > 0) {
            isAllSelected = cart.datas.every(item => item.checked);
        }
        setSelectedAll(isAllSelected);
    }, [cart.datas]);

    useEffect(() => {
        const fetchData = async () => {
            setFormData({
                name: cart.orderFor,
                pin: '',
                table: cart.tableId !== 0 ? {value: cart.tableId, label: cart.tableName} : null
            })
            const res = await getTableOptions()
            if (res && res.data.length > 0) {
                const dataFiltered = res.data.filter(item => item.id !== cart.tableId);
                setOptions(dataFiltered.map(item => ({
                    value: item.id,
                    label: item.name
                })));
            }
        }
        fetchData()
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        if (name === 'pin' && !/^\d*$/.test(value)) {
            return;
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (name === 'pin') return;
        cart.setOrderFor(value)
    };

    const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {value, name} = e.target;
        const id = parseInt(name.split('-')[1], 10);
        cart.setDatas(
            cart.datas.map(item => {
                if (item.id === id) {
                    return {...item, notes: value};
                }
                return item;
            })
        )
    };

    const handleChangeCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked, name} = e.target;
        const id = parseInt(name.split('-')[1], 10);
        const dataUpdate = cart.datas.map(item => {
            if (item.id === id) {
                return {...item, checked: checked};
            }
            return item;
        });
        cart.setDatas(
            dataUpdate
        );
        setSelectedAll(dataUpdate.every(item => item.checked));
    };

    const handleChangeAmount = (data: { increment: boolean; id: number }) => {
        const {increment, id} = data;
        const dataUpdate = cart.datas.map(item => {
            if (item.id === id) {
                const newAmount = increment ? item.amount + 1 : Math.max(1, item.amount - 1);
                return {...item, amount: newAmount};
            }
            return item;
        });
        cart.setDatas(
            dataUpdate
        );
    };

    const handleChangeTable = (value: { value: number; label: string } | null) => {
        setFormData(prevState => ({
            ...prevState,
            table: value
        }));
        cart.setTable({
            tableId: value ? value.value : 0,
            tableName: value ? value.label : ''
        })
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSelectedAll(isChecked);
        const dataUpdate = cart.datas.map(item => ({
            ...item,
            checked: isChecked
        }));
        cart.setDatas(
            dataUpdate
        )
    };

    const handleShowModalCheckout = () => {
        if (!formData.name) {
            notification.errorNotificationClient('Please enter a name for the order')
            return;
        }
        if (!formData.table || !formData.table.value) {
            notification.errorNotificationClient('Please select a table')
            return;
        }
        setFormData({
            ...formData,
            pin: ''
        })
        const selectedItems = cart.datas.filter(item => item.checked);
        if (selectedItems.length === 0) {
            notification.errorNotificationClient('Please select at least one item to checkout')
            return;
        }
        setShowModal(true)
    }

    const handleSubmitCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.pin === '' || !formData.table || formData.table.value === 0) {
            return;
        }
        if (formData.pin.length != 6) {
            notification.errorNotificationClient('Pin must be 6 digits')
            return;
        }
        setLoadingCheckout(true);
        const payload: BodyOrder = {
            pin: formData.pin,
            orderFor: formData.name,
            tableId: formData.table.value,
            datas: cart.datas.filter(item => item.checked).map(item => ({
                menuId: item.id,
                qty: item.amount,
                notes: item.notes
            }))
        }
        const res = await handleCheckout(payload)
        if (res) {
            cart.setCart({
                tableId: 0,
                tableName: '',
                orderFor: cart.orderFor,
                datas: cart.datas.filter(item => !item.checked),
            })
            setFormData({
                name: cart.orderFor,
                pin: '',
                table: {value: 0, label: ''}
            })
            setShowModal(false);
        }
        setLoadingCheckout(false);
    };

    return (
        <section className="container mx-auto my-10 px-4 text-gray-900 dark:text-gray-100">
            <Modal size={'md'} title={'Checkout'} show={showModal} handleClose={() => setShowModal(false)}>
                <div className="p-10 bg-white dark:bg-gray-800 rounded-lg">
                    <form onSubmit={handleSubmitCheckout}>
                        <Input type={'password'}
                               name={'pin'}
                               label={'Pin'}
                               placeholder={'Enter your pin'}
                               required={true}
                               onChange={handleChange}
                               value={formData.pin}
                        />
                        <div className="mt-10">
                            <button type="submit" disabled={loadingCheckout}
                                    className={`w-full btn-primary text-white py-3 px-7 rounded-lg font-bold ${loadingCheckout ? 'btn-loading' : ''}`}>
                                {loadingCheckout ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <PageHeader
                breadcrumb={[{label: 'Menu', to: '/menu'}, {label: 'Cart'}]}
                title="Cart"
            />

            <Card variant="default" padding="lg" className="mb-6">
                <div className="flex justify-between gap-5 sm:flex-row flex-col items-center">
                    <h4 className="font-bold text-3xl text-gray-900 dark:text-gray-100">
                        Diskusi Coffee
                    </h4>
                    <Link to={'/menu'}
                          className="text-primary font-bold text-base flex items-center gap-2">
                        <FaPlus/>
                        Add Menu
                    </Link>
                </div>
                <div className="flex justify-between mt-5 gap-5 md:flex-row flex-col items-center">
                    <div className="sm:w-96 w-full">
                        <InputIcon icon={<CiUser/>} onChange={handleChange} error={''} value={formData.name}
                                   type={'text'} name={'name'} placeholder={'Name'} label={'Order For'}
                                   required={true}/>
                    </div>
                    <div className="sm:w-96 w-full">
                        <DropDownIcon placeholder={'Select Table'} label={'Table'}
                                      options={options} icon={<CiUser/>}
                                      name={'table'}
                                      value={formData.table}
                                      setValue={handleChangeTable}
                                      setOptions={setOptions}/>
                    </div>
                </div>
            </Card>

            {cart.datas.length === 0 ? (
                <Card variant="default" padding="lg" className="text-center">
                    <div className="flex flex-col justify-center items-center py-16">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            Your cart is empty
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">
                            Looks like you haven't added anything yet.
                            Browse our menu to find your favorite coffee!
                        </p>
                        <Link to={'/menu'}
                              className="btn-primary text-white px-8 py-3 rounded-2xl mt-8 font-bold">
                            Browse Menu
                        </Link>
                    </div>
                </Card>
            ) : (
                <Card variant="default" padding="lg">
                    <div className="my-6">
                        <CheckBox name={"select all"} value={selectedAll} onChange={handleSelectAll}
                                  label={'Select All'}/>
                    </div>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 my-10 gap-10">
                        {cart.datas.map((item, index) => (
                            <CardCart handleChangeNotes={handleChangeNotes}
                                      handleChangeCheckBox={handleChangeCheckBox}
                                      handleChangeAmount={handleChangeAmount} {...item}
                                      photo={`${item.photo}`}
                                      key={index}/>
                        ))}
                    </div>
                    <div className="flex mt-10 justify-end">
                        <button
                            onClick={handleShowModalCheckout}
                            className="btn-tertiary flex items-center justify-between px-8 font-bold py-3 w-full max-w-lg rounded-2xl">
                            Checkout
                            <span>{formatCurrency(total)}</span>
                        </button>
                    </div>
                </Card>
            )}
        </section>
    );
}

export default CartPage;