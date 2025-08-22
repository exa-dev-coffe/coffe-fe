import {useState} from "react";
import {Link} from "react-router";
import {FaPlus} from "react-icons/fa";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {CiUser} from "react-icons/ci";
import DropDownIcon from "../../component/ui/form/DropDownIcon.tsx";
import CheckBox from "../../component/ui/form/CheckBox.tsx";
import {formatCurrency} from "../../utils";
import useCartContext from "../../hook/useCartContext.ts";
import CardCart from "../../component/ui/card/CardCart.tsx";

const CartPage = () => {

    const [formData, setFormData] = useState({
        name: ''
    })

    const cart = useCartContext()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleChangeNotes = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        cart.updateCartItem(id, {notes: e.target.value});
    };

    const handleChangeCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
        cart.updateCartItem(id, {checked: e.target.checked});
    };

    const handleChangeAmount = (data: { increment: boolean; id: number }) => {
        cart.updateCartItem(data.id, {amount: data.increment ? 1 : -1});
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
                                      options={[

                                          {value: 1, label: 'Table 1'},
                                          {value: 2, label: 'Table 2'},
                                          {value: 3, label: 'Table 3'},
                                          {value: 4, label: 'Table 4'},
                                          {value: 5, label: 'Table 5'}
                                      ]} icon={<CiUser/>}
                                      name={'table'}
                                      value={{value: 1, label: 'Table 1'}}
                                      onChange={(value) => console.log(value)}/>
                    </div>
                </div>
                <div className={'my-10'}>
                    <CheckBox name={"select all"} value={''} onChange={handleChange} label={'Select All'}/>
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
