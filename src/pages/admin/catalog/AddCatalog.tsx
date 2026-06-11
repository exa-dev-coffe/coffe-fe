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
import Card from "../../../component/ui/Card.tsx";

const AddCatalogPage = () => {

    const {addMenu, error} = useMenu()
    const {getCategoryOptions, options, setOptions} = useCategory()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        priceFormated: "Rp 0",
        isAvailable: true,
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
        const {name, value} = e.target;
        if (name === 'price') {
            const formattedValue = value.replace(/[^0-9,]/g, '').replace(/,/g, '.');
            setFormData({
                ...formData,
                [name]: Number(formattedValue),
                priceFormated: formatCurrency(Number(formattedValue))
            });
            return;
        } else if (name === 'isAvailable') {
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
        if (e.type === 'drop') {
            const files = (e as React.DragEvent<HTMLDivElement>).dataTransfer.files;
            if (files && files[0]) {
                setFormData({
                    ...formData,
                    photo: files[0]
                });
            }
        } else if (e.target instanceof HTMLInputElement && e.target.files) {
            const file = e.target.files[0];
            if (file) {
                setFormData({
                    ...formData,
                    photo: file
                });
            }
        }
    }

    const handleSelect = (value: { label: string; value: number } | null) => {
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
        addMenu(data)
    }

    return (
        <div className={'container mx-auto px-4'}>
            <HeaderDashboard title={'Manage Catalog'}
                             description={'Organize and manage all items available in your menu.'}/>
            <Card variant="dashboard" className="mt-10">
                <div className={'flex justify-between border-b pb-8 border-slate-100 dark:border-slate-700'}>
                    <div className={'flex gap-4 items-center'}>
                        <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                            Menu
                        </h4>
                        <BiSolidRightArrow className={'text-slate-600 dark:text-slate-300'}/>
                        <h4 className={'text-xl font-semibold text-slate-800 dark:text-slate-100'}>
                            Add Menu
                        </h4>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className={'my-8 space-y-10'}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-10">
                            <Input label={'Menu Name'}
                                   placeholder={'Menu Name'}
                                   name={'name'}
                                   type={'text'}
                                   disabled={false}
                                   required={true}
                                   onChange={handleChange}
                                   value={formData.name}
                                   error={error.name}/>
                            <Input label={'Price'}
                                   placeholder={'Price'}
                                   name={'price'}
                                   type={'text'}
                                   disabled={false}
                                   required={true}
                                   onChange={handleChange}
                                   value={formData.priceFormated}
                                   error={error.price}/>
                            <DropDown label={"Category"}
                                      name={'category_id'}
                                      setValue={handleSelect}
                                      setOptions={setOptions}
                                      value={formData.category}
                                      placeholder={'Select Category'}
                                      options={options}/>
                            <CheckBox name={'isAvailable'} value={formData.isAvailable} onChange={handleChange}
                                      label={"Is Available"}
                                      required={true}
                                      disabled={false}/>
                        </div>
                        <div className="space-y-10">
                            <TextArea label={'Description'}
                                      placeholder={'Write a description of this coffee variety, including its flavor profile, origin, and roast level'}
                                      name={'description'}
                                      disabled={false}
                                      required={true}
                                      onChange={handleChange}
                                      value={formData.description}
                                      error={error.description}/>
                            <InputFoto
                                name={'image'}
                                setValue={handleInputFoto}
                                value={formData.photo}
                                error={error.photo}
                            />
                        </div>
                    </div>
                    <div className={'flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-700'}>
                        <Link to={'/dashboard/manage-catalog'}>
                            <button type={'button'}
                                    className={'btn-danger text-white sm:px-10 px-5 font-semibold py-2 rounded-lg'}>
                                Cancel
                            </button>
                        </Link>
                        <button type={'submit'}
                                className={'btn-primary text-white sm:px-10 px-5 font-semibold py-2 rounded-lg'}>
                            Save
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default AddCatalogPage;