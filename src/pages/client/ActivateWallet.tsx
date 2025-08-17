import Modal from "../../component/ui/Modal.tsx";
import Icon from "../../assets/images/icon.png";
import {useEffect, useState} from "react";
import {IoWalletOutline} from "react-icons/io5";
import InputIcon from "../../component/ui/form/InputIcon.tsx";
import {GoKey} from "react-icons/go";
import useWallet from "../../hook/useWallet.tsx";
import {useNavigate} from "react-router";

const ActivateWalletPage = () => {

    const [open, setOpen] = useState(true);
    const [form, setForm] = useState({
        pin: '',
        confirmPin: '',
    });
    const navigate = useNavigate();
    const {checkWallet} = useWallet()

    useEffect(() => {
        const fetchWallet = async () => {
            const res = await checkWallet();
            if (res && res.data && res.data.is_active) {
                navigate('/my-wallet');
            }
        };
        fetchWallet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const validPin = /^[0-9]*$/; // Regex to allow only numbers
        if (name === 'pin' || name === 'confirmPin') {
            if (!validPin.test(value)) {
                return; // Prevent non-numeric input
            }
        }

        setForm(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <section className="container mx-auto my-10">

            <Modal
                title="Activate Your Wallet"
                size={'sm'}
                persist={true}
                noHeader={true}
                type={'blur'}
                handleClose={() => setOpen(false)}
                show={open}
            >
                <div className={'relative h-40 flex items-center justify-center'}>
                    <img src={Icon} className={'w-20 h-20 -translate-x-8 absolute'} alt={'icon'}/>
                    <div className={' translate-x-8 p-3  absolute bg-white rounded-full border'}>
                        <IoWalletOutline className={'w-14 h-14'}/>
                    </div>
                </div>
                <div className="mt-6 px-28 ">
                    <h2 className="text-2xl text-center font-bold mb-4">Activate Your Wallet</h2>
                    <p className="text-gray-600 mb-6">
                        Streamline your payment process by utilizing a digital wallet, allowing you to complete
                        transactions more quickly, securely, and conveniently without the need for cash or physical
                        cards.
                    </p>
                    <p className="text-gray-600 mb-6">
                        By selecting "<strong>Continue</strong>" you agree to Diskusi User Privacy Policy
                    </p>
                    <div className="flex justify-center mt-10 mb-20">
                        <button
                            onClick={() => setOpen(false)}
                            className="btn-primary px-10 py-3 text-white rounded-md "
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </Modal>
            <div className={'flex gap-5'}>
                <h4>
                    Menu
                </h4>
                <span>
                    /
                </span>
                <h4 className={'font-bold'}>
                    Wallet
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl '}>
                <div className={'relative h-40 flex items-center justify-center'}>
                    <img src={Icon} className={'w-20 h-20 -translate-x-8 absolute'} alt={'icon'}/>
                    <div className={' translate-x-8 p-3  absolute bg-white rounded-full border'}>
                        <IoWalletOutline className={'w-14 h-14'}/>
                    </div>
                </div>
                <h3 className={'text-3xl text-center font-bold mb-4'}>
                    Setup Your Wallet
                </h3>
                <form className={'w-1/3 space-y-10 my-14  mx-auto'} onSubmit={e => e.preventDefault()}>
                    <InputIcon
                        error={''}
                        disabled={false}
                        name={'pin'}
                        value={form.pin}
                        onChange={handleChange}
                        label="PIN"
                        placeholder="Type your pin"
                        icon={<GoKey/>}
                        type="text"
                        required={true}
                    />
                    <InputIcon
                        error={''}
                        disabled={false}
                        name={'confirmPin'}
                        value={form.confirmPin}
                        onChange={handleChange}
                        label="Retype PIN"
                        placeholder="Retype your pin"
                        icon={<GoKey/>}
                        type="text"
                        required={true}
                    />
                    <button className={'btn-primary px-10 py-3 mt-5 text-white rounded-xl w-full'} type="submit"
                    >
                        Activate
                    </button>
                </form>
            </div>
        </section>
    )
}

export default ActivateWalletPage;