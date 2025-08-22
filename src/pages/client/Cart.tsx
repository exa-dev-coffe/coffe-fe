import {useState} from "react";
import {Link} from "react-router";
import {FaPlus} from "react-icons/fa";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {CiCircleMinus, CiCirclePlus, CiUser} from "react-icons/ci";
import DropDownIcon from "../../component/ui/form/DropDownIcon.tsx";
import CheckBox from "../../component/ui/form/CheckBox.tsx";
import DummyProduct from '../../assets/images/dummyProduct.png';
import {formatCurrency} from "../../utils";
import useCartContext from "../../hook/useCartContext.ts";
import TextArea from "../../component/ui/form/TextArea.tsx";

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
                A
                <div className={'my-10'}>
                    <CheckBox name={"select all"} value={''} onChange={handleChange} label={'Select All'}/>
                </div>
                <div>
                    <div className={'flex items-start gap-4'}>
                        <CheckBox name={'checked-id'} value={''} onChange={handleChange}/>
                        <img className={'w-48 w-48 object-cover rounded-xl'} src={DummyProduct}
                             alt={'name product'}/>
                        <div className={'space-y-3 text-3xl'}>
                            <h4 className={''}>
                                Nama Product
                            </h4>
                            <h6 className={'text-xl'}>
                                {formatCurrency(10000)}
                            </h6>
                            <div className={'flex  items-center gap-2 text-3xl mt-10'}>
                                <button
                                    className={'disabled:cursor-not-allowed cursor-pointer'}
                                >
                                    <CiCircleMinus/>
                                </button>
                                <span className={'text-gray-600'}>
                                                        {`1`}
                                                    </span>
                                <button
                                    className={'cursor-pointer'}
                                >

                                    <CiCirclePlus
                                    />
                                </button>
                                <TextArea label={'Notes'} name={'notes'} value={''} placeholder={'Add notes here...'}
                                          setValue={handleChange}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CartPage;
