import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import {BiSolidRightArrow} from "react-icons/bi";
import Input from "../../../component/ui/form/Input.tsx";
import TextArea from "../../../component/ui/form/TextArea.tsx";
import {Link} from "react-router";

const AddCatalogPage = () => {

    const {getMenu} = useMenu()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    }

    return (
        <div className={'container mx-auto'}>
            <HeaderDashboard title={'Manage Catalog'}
                             description={`you can organize and manage all items available in your menu.`}/>
            <div className={'mt-10 bg-white p-8 rounded-lg'}>
                <div className={'flex justify-between  border-b pb-8'}>
                    <div className={'flex gap-4 items-center'}>
                        <h4 className={'text-xl font-semibold'}>
                            Menu
                        </h4>
                        <BiSolidRightArrow/>
                        <h4 className={'text-xl font-semibold'}>
                            Add Menu
                        </h4>
                    </div>
                </div>
                <form className={'my-8 space-y-10'}>
                    <Input label={'Menu Name'}
                           placeholder={'Menu Name'}
                           name={'name'}
                           type={'text'}
                           disabled={false}
                           required={true}
                           onChange={handleChange}
                           value={formData.name}
                           error={''}/>
                    <TextArea label={'Description'}
                              placeholder={'Write a description of this coffee variety, including its flavor profile, origin, and roast level'}
                              name={'description'}
                              disabled={false}
                              required={true}
                              onChange={handleChange}
                              value={formData.description}
                              error={''}/>
                    <Input label={'Price'}
                           placeholder={'Price'}
                           name={'price'}
                           type={'text'}
                           disabled={false}
                           required={true}
                           onChange={handleChange}
                           value={formData.price}
                           error={''}/>
                    <div className={'flex justify-end'}>
                        <button type={'submit'}
                                className={'btn-primary text-white px-10 w-32 font-semibold py-2 rounded-lg'}>
                            Save
                        </button>
                        <Link to={'/dashboard/manage-catalog'}>
                            <button type={'button'}
                                    className={'btn-danger text-white px-10 w-32 font-semibold py-2 rounded-lg ml-4'}>
                                Cancel
                            </button>
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddCatalogPage;