import BgRegister from '../../assets/images/bgRegis.png';
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

    const {register} = useAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Here you can handle the form submission, e.g., send data to the server
        console.log('Form submitted:', formData);
        register(formData);
        // Reset form after submission
        setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    }

    return (
        <div className={'grid grid-cols-2'}>
            <div className={'flex items-center justify-center p-16'}>
                <div className={'bg-white px-10 py-8 w-full rounded-4xl'}>
                    <h1 className="text-2xl font-bold text-black md:text-4xl">Become a Member</h1>
                    <form onSubmit={handleSubmit} className={'mt-10 space-y-8'}>
                        <InputIcon icon={<IoPersonOutline/>} label={'Complete Name'} type={'text'}
                                   required={true} disabled={false} value={formData.fullName}
                                   onChange={handleChange}
                                   placeholder={'Type your complete name'} name={'fullName'}/>
                        <InputIcon icon={<TfiEmail/>} label={'Email Address'} type={'email'}
                                   required={true} disabled={false} value={formData.email}
                                   onChange={handleChange}
                                   placeholder={'Type your valid email'} name={'email'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Password'} type={'password'}
                                   required={true} disabled={false} value={formData.password}
                                   onChange={handleChange}
                                   placeholder={'Type your password'} name={'password'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Confirm Password'} type={'password'}
                                   required={true} disabled={false} value={formData.confirmPassword}
                                   onChange={handleChange}
                                   placeholder={'Type your password'} name={'confirmPassword'}/>
                        <button type="submit"
                                className={'px-5 mt-10 py-3 btn-primary text-white w-full rounded-2xl'}>Create
                            My Account
                        </button>
                    </form>
                </div>
            </div>
            <div>
                <img className={'absolute h-screen w-1/2 top-0'} src={BgRegister} alt={'Register Image'}/>
            </div>
        </div>
    )
}

export default RegisterPage;