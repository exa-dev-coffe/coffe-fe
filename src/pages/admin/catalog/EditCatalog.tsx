import HeaderDashboard from "../../../component/HeaderDashboard.tsx";
import {useEffect, useState} from "react";
import useMenu from "../../../hook/useMenu.ts";
import {BiSolidRightArrow} from "react-icons/bi";
import Input from "../../../component/ui/form/Input.tsx";
import TextArea from "../../../component/ui/form/TextArea.tsx";
import {Link, useParams} from "react-router";
import InputFoto from "../../../component/ui/form/InputFoto.tsx";
import DropDown from "../../../component/ui/form/DropDown.tsx";
import CheckBox from "../../../component/ui/form/CheckBox.tsx";
import {formatCurrency} from "../../../utils";
import useCategory from "../../../hook/useCategory.ts";
import NotFoundPage from "../../404.tsx";

const EditCatalogPage = () => {

    const {editMenu, getMenuById, error} = useMenu()
    const {getCategoryOptions, options, setOptions} = useCategory()
    const params = useParams<Readonly<{ id: string }>>()
    const [notFound, setNotFound] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        id: 0,
        description: '',
        price: 0,
        priceFormated: "Rp 0",
        isAvailable: true,
        photoBefore: '',
        photo: '' as string | File,
        category: null as { label: string; value: number } | null,
    });

    useEffect(() => {
        const fetchCategoryOptions = async () => {

            const [menu, optionsTemp] = await Promise.all([getMenuById(Number(params.id)), getCategoryOptions()]);
            if (!menu) {
                setNotFound(true);
                return;
            } else {
                const data = menu;
                const category = optionsTemp?.find(item => Number(item.value) === Number(data.category_id));
                setFormData({
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    photoBefore: data.photo,
                    price: data.price,
                    priceFormated: formatCurrency(data.price),
                    isAvailable: data.isAvailable,
                    photo: `${data.photo}`,
                    category: category || null
                });
            }
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
        } else if (name === 'isAvailable') {
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
            categoryId: formData.category?.value,
        }
        editMenu(data)
    }

    if (notFound) {
        return (
            <NotFoundPage/>
        );
    }

    return (
        <div className={'container mx-auto px-4'}>
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
                            Edit Menu
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
                    <CheckBox name={'isAvailable'} value={formData.isAvailable} onChange={handleChange}
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
                                className={'btn-primary text-white sm:px-10 px-5  w-24 sm:w-32 font-semibold py-2 rounded-lg'}>
                            Save
                        </button>
                        <Link to={'/dashboard/manage-catalog'}>
                            <button type={'button'}
                                    className={'btn-danger text-white sm:px-10 px-5  w-24 sm:w-32 font-semibold py-2 rounded-lg ml-4'}>
                                Cancel
                            </button>
                        </Link>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditCatalogPage;