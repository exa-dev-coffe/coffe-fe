import BgRegister from '../../assets/images/bgRegis.png';
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {TfiEmail} from "react-icons/tfi";
import {MdOutlineLock} from "react-icons/md";
import {useState} from "react";
import useAuth from "../../hook/useAuth.ts";
import {Link} from "react-router";

const LoginPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const {login, error} = useAuth()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login(formData);
    }

    return (
        <div className={'grid grid-cols-2'}>
            <div className={'flex items-center justify-center p-16'}>
                <div className={'bg-white mt-24 px-10 py-8 w-full rounded-4xl'}>
                    <h1 className="text-2xl font-bold text-black md:text-4xl">
                        Welcome Back,
                        <br/>
                        Login to your Account
                    </h1>
                    <p className={'text-gray-500 mt-2'}>
                        Don’t have an account? <Link to={'/register'} className={'text-blue-500'}>Sign Up Free!</Link>
                    </p>
                    <form onSubmit={handleSubmit} className={'mt-10 space-y-8'}>
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
                        <button type="submit"
                                className={'px-5 mt-10 py-3 btn-primary text-white w-full rounded-2xl font-bold'}>
                            Login to My Account
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

export default LoginPage;