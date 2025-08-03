import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import {BiSolidRightArrow} from "react-icons/bi";
import Input from "../../../component/ui/form/Input.tsx";
import TextArea from "../../../component/ui/form/TextArea.tsx";
import {Link} from "react-router";
import InputFoto from "../../../component/ui/form/InputFoto.tsx";
import DropDown from "../../../component/ui/form/DropDown.tsx";
import CheckBox from "../../../component/ui/form/CheckBox.tsx";
import {formatCurrency} from "../../../utils";
import useCategory from "../../../hook/useCategory.ts";

const AddCatalogPage = () => {

    const {addMenu, error} = useMenu()
    const {getCategoryOptions, options, setOptions} = useCategory()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        priceFormated: "Rp 0",
        is_available: true,
        photo: '' as string | File,
        category: null as { label: string; value: number } | null,
    });

    useEffect(() => {
        const fetchCategoryOptions = async () => {
            await getCategoryOptions();
        }
        fetchCategoryOptions();
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Handle input changes for the form
        const {name, value} = e.target;
        if (name === 'price') {
            // Format price input to allow only numbers and commas
            const formattedValue = value.replace(/[^0-9,]/g, '').replace(/,/g, '.');
            setFormData({
                ...formData,
                [name]: Number(formattedValue),
                priceFormated: formatCurrency(Number(formattedValue))
            });
            return;
        } else if (name === 'is_available') {
            // Handle checkbox input for availability
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked
            });
            return;
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    }

    const handleInputFoto = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
        // Handle file input for the menu image
        if (e.type === 'drop') {
            const files = (e as React.DragEvent<HTMLDivElement>).dataTransfer.files;
            if (files && files[0]) {
                // Process the file here
                setFormData({
                    ...formData,
                    photo: files[0]
                });
            }
        } else if (e.target instanceof HTMLInputElement && e.target.files) {
            const file = e.target.files[0];
            if (file) {
                // Process the file here
                setFormData({
                    ...formData,
                    photo: file
                });
            }
        } else {
            console.warn('Invalid file input');
        }
    }

    const handleSelect = (value: { label: string; value: number } | null) => {
        // Handle category selection
        setFormData({
            ...formData,
            category: value
        });
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            ...formData,
            category_id: formData.category?.value,
        }
        addMenu(data)
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
                <form onSubmit={handleSubmit} className={'my-8 space-y-10'}>
                    <Input label={'Menu Name'}
                           placeholder={'Menu Name'}
                           name={'name'}
                           type={'text'}
                           disabled={false}
                           required={true}
                           onChange={handleChange}
                           value={formData.name}
                           error={error.name}/>
                    <TextArea label={'Description'}
                              placeholder={'Write a description of this coffee variety, including its flavor profile, origin, and roast level'}
                              name={'description'}
                              disabled={false}
                              required={true}
                              onChange={handleChange}
                              value={formData.description}
                              error={error.description}/>
                    <Input label={'Price'}
                           placeholder={'Price'}
                           name={'price'}
                           type={'text'}
                           disabled={false}
                           required={true}
                           onChange={handleChange}
                           value={formData.priceFormated}
                           error={error.price}/>
                    <CheckBox name={'is_available'} value={formData.is_available} onChange={handleChange}
                              label={"Is Available"}
                              required={true}
                              disabled={false}/>
                    <DropDown label={"Category"}
                              name={'category_id'}
                              setValue={handleSelect}
                              setOptions={setOptions}
                              value={formData.category}
                              placeholder={'Select Category'}
                              options={options}/>
                    <InputFoto
                        name={'image'}
                        setValue={handleInputFoto}
                        value={formData.photo}
                        error={error.photo}
                    />
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