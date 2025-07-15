import BgRegister from '../../assets/images/bgRegis.png';
import {IoPersonOutline} from "react-icons/io5";

const RegisterPage = () => {
    return (
        <div className={'grid grid-cols-2'}>
            <div className={'flex items-center justify-center p-16'}>
                <div className={'bg-white px-10 py-8 w-full rounded-4xl'}>
                    <h1 className="text-2xl font-bold text-black md:text-4xl">Become a Member</h1>
                    <form className={'mt-10'}>
                        <div>
                            <label htmlFor={'name'} className={'font-bold text-xl'}>
                                Complete Name
                            </label>
                            <div
                                className={'text-2xl flex items-center  border border-gray-300 rounded-2xl  mt-2'}>
                                <div className={'text-2xl h-full rounded-2xl rounded-r-none bg-gray-300 px-3 py-2'}>
                                    <IoPersonOutline/>
                                </div>
                                <input name={'name'} className={'w-full focus:outline-none px-2 py-1'} id={'name'}
                                       type={'text'}
                                       placeholder={'Enter Name'}/>
                            </div>
                        </div>
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