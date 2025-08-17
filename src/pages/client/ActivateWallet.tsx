import Modal from "../../component/ui/Modal.tsx";
import Icon from "../../assets/images/icon.png";
import {useState} from "react";
import {IoWalletOutline} from "react-icons/io5";

const ActivateWalletPage = () => {

    const [open, setOpen] = useState(true);

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
            </div>
        </section>
    )
}

export default ActivateWalletPage;