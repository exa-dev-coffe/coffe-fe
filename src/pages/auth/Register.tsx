import BgRegister from '../../assets/images/bgRegis.webp';
import {IoPersonOutline} from "react-icons/io5";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {TfiEmail} from "react-icons/tfi";
import {MdOutlineLock} from "react-icons/md";
import {useState} from "react";
import useAuth from "../../hook/useAuth.ts";

const RegisterPage = () => {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const {register, error} = useAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        register(formData);
    }

    return (
        <div className={'grid lg:grid-cols-2'}>
            <div className={'flex items-center justify-center p-5 min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900'}>
                <div
                    className={'bg-white dark:bg-gray-800 px-5 sm:px-10 py-8 w-full rounded-4xl shadow-md dark:shadow-none lg:min-h-[830px] lg:h-full'}>
                    <h1 className="text-2xl font-bold text-black dark:text-white md:text-4xl">Become a Member</h1>
                    <form onSubmit={handleSubmit} className={'mt-10 space-y-6'}>
                        <InputIcon icon={<IoPersonOutline/>} label={'Complete Name'} type={'text'}
                                   required={true} disabled={false} value={formData.fullName}
                                   error={error.fullName}
                                   onChange={handleChange}
                                   placeholder={'Type your complete name'} name={'fullName'}/>
                        <InputIcon icon={<TfiEmail/>} label={'Email Address'} type={'email'}
                                   required={true} disabled={false} value={formData.email}
                                   error={error.email}
                                   onChange={handleChange}
                                   placeholder={'Type your valid email'} name={'email'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Password'} type={'password'}
                                   error={error.password}
                                   required={true} disabled={false} value={formData.password}
                                   onChange={handleChange}
                                   placeholder={'Type your password'} name={'password'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Confirm Password'} type={'password'}
                                   required={true} disabled={false} value={formData.confirmPassword}
                                   error={error.confirmPassword}
                                   onChange={handleChange}
                                   placeholder={'Type your password'} name={'confirmPassword'}/>
                        <button type="submit"
                                className={'px-5 mt-10 py-3 btn-primary text-white font-bold w-full rounded-2xl dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-600'}>
                            Create My Account
                        </button>
                    </form>
                </div>
            </div>
            <div className={'lg:block hidden'}>
                <img className={'absolute h-screen w-1/2 top-0 object-cover dark:opacity-60'} src={BgRegister}
                     alt={'Register Image'}/>
            </div>
        </div>
    )
}

export default RegisterPage;