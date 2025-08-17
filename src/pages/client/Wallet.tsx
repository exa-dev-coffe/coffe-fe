import ImgBgWalletNotActive from '../../assets/images/ImgBgWalletNotActive.png';
import {Link} from "react-router";
import useWallet from "../../hook/useWallet.ts";
import WalletSkeleton from "../../component/ui/Skeleton/WalletSkeleton.tsx";
import {useEffect, useState} from "react";

const WalletPage = () => {

    const {checkWallet, loading} = useWallet()
    const [_active, setActive] = useState(false);

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
                    <div className={'mt-10 bg-white p-8 rounded-2xl '}>
                        <img className={'mx-auto'} src={ImgBgWalletNotActive}
                             alt={'Image background wallet not active'}/>
                        <div className={'flex flex-col items-center'}>
                            <h3 className={'text-3xl font-bold text-gray-700 mb-4'}>
                                Upps..
                            </h3>
                            <p className={'text-gray-500 text-xl text-center mb-6'}>
                                Your balance is not active yet
                            </p>
                            <Link to={'/my-wallet/activate'}
                                  className={'btn-primary mt-4 mb-10 text-white px-6 py-2 rounded-md'}>
                                Activate
                            </Link>
                        </div>
                    </div>
            }
        </section>
    );
}

export default WalletPage;
