import useWallet from "../../hook/useWallet.ts";
import WalletSkeleton from "../../component/ui/Skeleton/WalletSkeleton.tsx";
import {useEffect, useState} from "react";
import WalletNotActive from "../../component/WalletNotActive.tsx";
import Logo from "../../assets/images/icon.png";
import ImgBgWalletNotActive from "../../assets/images/ImgBgWalletNotActive.png";
import ImgBgTopWallet from "../../assets/images/bgTopWallet.png";

const WalletPage = () => {

    const {checkWallet, loading} = useWallet()
    const [active, setActive] = useState(false);

    useEffect(() => {
        const fetchWallet = async () => {

            const res = await checkWallet();
            if (res && res.data) {
                setActive(res.data.is_active);
            } else {
                setActive(false);
            }
        };
        fetchWallet();
    }, []);

    return (
        <section className="container mx-auto my-10">
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

            {
                loading ? <WalletSkeleton/> :
                    active ?
                        <>
                            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                                <h4 className={'font-bold text-3xl'}>
                                    Wallet
                                </h4>
                            </div>
                            <div className={'mt-10 bg-white p-8 rounded-2xl grid grid-cols-2'}>
                                <div className={'w-full mt-10'}>
                                    <div className={'flex justify-between items-center w-full'}>
                                        <h4 className={'font-bold text-2xl'}>
                                            Your Balance
                                        </h4>
                                        <button className={'btn-primary px-8 py-2 rounded-md text-white'}>
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
                                </div>
                                <img className={'mx-auto'} src={ImgBgWalletNotActive}
                                     alt={'Image background wallet not active'}/>
                            </div>
                        </>
                        :
                        <WalletNotActive/>
            }
        </section>
    );
}

export default WalletPage;
