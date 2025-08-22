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

const CartPage = () => {

    const [formData, setFormData] = useState<{
        name: string;
        table: { value: number; label: string } | null;
    }>({
        name: '',
        table: {value: 0, label: ''}
    })
    const [selectedAll, setSelectedAll] = useState(false);
    const {getTableOptions, options, setOptions} = useTable()
    const cart = useCartContext()

    useEffect(() => {
        const isAllSelected = cart.cart.datas.every(item => item.checked);
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
        cart.updateCartItem(data.id, {amount: data.increment ? 1 : -1});
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
                               type={'text'} name={'name'} placeholder={'Name'} label={'Name'}
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
                <div>
                    {
                        cart.cart.datas.map((item, index) => (
                            <CardCart handleChangeNotes={handleChangeNotes} handleChangeCheckBox={handleChangeCheckBox}
                                      handleChangeAmount={handleChangeAmount} {...item}
                                      photo={`${import.meta.env.VITE_APP_IMAGE_URL}/${item.photo}`}
                                      key={index}/>
                        ))
                    }
                </div>
                <div className={'flex justify-end gap-4'}>
                    <button
                        className={'btn-tertiary items-center flex justify-between px-6 font-bold py-3 w-full max-w-lg  rounded-2xl '}>
                        Checkout
                        <span>
                            {formatCurrency(10000)}
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}

export default CartPage;
