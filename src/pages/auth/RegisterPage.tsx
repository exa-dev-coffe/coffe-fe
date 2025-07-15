import BgRegister from '../../assets/images/bgRegis.png';

const RegisterPage = () => {
    return (
        <div className={'grid grid-cols-2'}>
            <div>
                <h1 className="text-3xl font-bold text-black md:text-4xl">Become a Member</h1>
            </div>
            <div>
                <img className={'absolute h-screen w-1/2 top-0'} src={BgRegister} alt={'Register Image'}/>
            </div>
        </div>
    )
}

export default RegisterPage;