import BgRegister from '../../assets/images/bgRegis.png';
import {IoPersonOutline} from "react-icons/io5";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {TfiEmail} from "react-icons/tfi";
import {MdOutlineLock} from "react-icons/md";

const RegisterPage = () => {
    return (
        <div className={'grid grid-cols-2'}>
            <div className={'flex items-center justify-center p-16'}>
                <div className={'bg-white px-10 py-8 w-full rounded-4xl'}>
                    <h1 className="text-2xl font-bold text-black md:text-4xl">Become a Member</h1>
                    <form className={'mt-10 space-y-8'}>
                        <InputIcon icon={<IoPersonOutline/>} label={'Complete Name'} type={'text'}
                                   placeholder={'Type your complete name'} name={'fullName'}/>
                        <InputIcon icon={<TfiEmail/>} label={'Email Address'} type={'email'}
                                   placeholder={'Type your valid email'} name={'email'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Password'} type={'password'}
                                   placeholder={'Type your password'} name={'password'}/>
                        <InputIcon icon={<MdOutlineLock/>} label={'Confirm Password'} type={'password'}
                                   placeholder={'Type your password'} name={'confirm_password'}/>
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