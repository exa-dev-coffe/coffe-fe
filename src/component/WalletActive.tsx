import ImgBgTopWallet from "../assets/images/bgTopWallet.png";
import Logo from "../assets/images/icon.png";
import {formatNumberCurrency} from "../utils";
import ImgBgWalletNotActive from "../assets/images/ImgBgWalletNotActive.png";
import CardHistoryWallet from "./ui/card/CardHistoryWallet.tsx";

interface WalletActiveProps {
    balance: number;
    handleTopUp: () => void
}

const WalletActive: React.FC<WalletActiveProps> = ({balance, handleTopUp}) => {
    return (
        <>
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-5xl'}>
                    Wallet
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl grid grid-cols-2'}>
                <div className={'w-full mt-10'}>
                    <div className={'flex justify-between items-center w-full'}>
                        <h4 className={'font-bold text-2xl'}>
                            Your Balance
                        </h4>
                        <button onClick={handleTopUp} className={'btn-primary px-8 py-2 rounded-md text-white'}>
                            Top Up
                        </button>
                    </div>
                    <div className={'w-full h-48  bg-no-repeat bg-cover mt-20'}
                         style={
                             {
                                 backgroundImage: `url(${ImgBgTopWallet})`,
                             }
                         }>
                        <img className={'h-20 ms-7 pt-6'} src={Logo} alt={'Logo'}/>
                        <h5 className={'text-end text-5xl me-8 pt-4 font-thin text-white'}>Wallet</h5>
                    </div>
                    <div className={'h-48 w-full rounded-b-md py-8 px-7 space-y-6    bg-[#263238]'}>
                        <h4 className={'text-5xl text-white'}>
                            Rp.
                        </h4>
                        <h6 className={'text-5xl text-white'}>
                            {formatNumberCurrency(balance)}
                        </h6>
                    </div>
                </div>
                <img className={'mx-auto'} src={ImgBgWalletNotActive}
                     alt={'Image background wallet not active'}/>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl'}>
                <h4 className={'font-bold mb-10 text-5xl'}>
                    History
                </h4>
                <CardHistoryWallet/>
            </div>
        </>
    )
}

export default WalletActive