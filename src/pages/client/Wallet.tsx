import useWallet from "../../hook/useWallet.ts";
import WalletSkeleton from "../../component/ui/Skeleton/WalletSkeleton.tsx";
import {useEffect, useState} from "react";
import WalletNotActive from "../../component/WalletNotActive.tsx";
import WalletActive from "../../component/WalletActive.tsx";
import type {Wallet} from "../../model/wallet.ts";

const WalletPage = () => {

    const {checkWallet, loading} = useWallet()
    const [data, setData] = useState<Wallet>({
        balance: 0,
        is_active: false
    });

    useEffect(() => {
        const fetchWallet = async () => {

            const res = await checkWallet();
            if (res && res.data) {
                setData({
                    is_active: res.data.is_active,
                    balance: res.data.balance
                })
            } else {
                setData({
                    is_active: false,
                    balance: 0
                })
            }
        };
        fetchWallet();
    }, []);

    const handleTopUp = () => {
    }

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
                    data.is_active ?
                        <WalletActive balance={data.balance} handleTopUp={handleTopUp}/>
                        :
                        <WalletNotActive/>
            }
        </section>
    );
}

export default WalletPage;
