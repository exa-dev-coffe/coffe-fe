import useWallet from "../../hook/useWallet.ts";
import WalletSkeleton from "../../component/ui/Skeleton/WalletSkeleton.tsx";
import {useEffect, useState} from "react";
import WalletNotActive from "../../component/WalletNotActive.tsx";
import WalletActive from "../../component/WalletActive.tsx";
import type {Wallet} from "../../model/wallet.ts";

const WalletPage = () => {

    const {checkWallet, loading, handleTopUp} = useWallet()

    const [data, setData] = useState<Wallet>({
        balance: 0,
        isActive: false
    });

    useEffect(() => {
        const fetchWallet = async () => {
            const res = await checkWallet();
            if (res && res.data) {
                setData({
                    isActive: res.data.isActive,
                    balance: res.data.balance
                })
            } else {
                setData({
                    isActive: false,
                    balance: 0
                })
            }
        };
        fetchWallet();
    }, []);


    return (
        <section className="container mx-auto my-10 px-4">
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
                    data.isActive ?
                        <WalletActive balance={data.balance} handleTopUp={handleTopUp}/>
                        :
                        <WalletNotActive/>
            }
        </section>
    );
}

export default WalletPage;
