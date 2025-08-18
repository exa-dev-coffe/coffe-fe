import useWallet from "../../hook/useWallet.ts";
import WalletSkeleton from "../../component/ui/Skeleton/WalletSkeleton.tsx";
import {type FormEvent, useEffect, useState} from "react";
import WalletNotActive from "../../component/WalletNotActive.tsx";
import WalletActive from "../../component/WalletActive.tsx";
import type {Wallet} from "../../model/wallet.ts";
import Modal from "../../component/ui/Modal.tsx";
import Input from "../../component/ui/form/Input.tsx";
import {formatCurrency} from "../../utils";
import useNotificationContext from "../../hook/useNotificationContext.ts";

const WalletPage = () => {

    const {checkWallet, loading, handleTopUp} = useWallet()
    const notification = useNotificationContext()
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState({
        amount: 0,
        amountFormatted: 'Rp 0',
    });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (name === 'amount') {
            // Format price input to allow only numbers and commas
            const formattedValue = value.replace(/[^0-9,]/g, '').replace(/,/g, '.');
            setAmount({
                amount: parseFloat(formattedValue) || 0,
                amountFormatted: formatCurrency(parseFloat(formattedValue) || 0)
            })
            return;
        }
    }

    const handleSubmitTopUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (amount.amount <= 0) {
            notification.setNotification({
                type: 'error',
                message: 'Please enter a valid amount to top up.',
                duration: 3000,
                size: 'md',
                isShow: true,
                mode: 'client'
            })
            return;
        }
        const res = await handleTopUp(amount.amount)
        if (res) {
            window.snap.pay(
                res.data.token,
                {
                    onError: (error) => {
                        console.error("Payment error:", error);
                        notification.setNotification({
                            type: 'error',
                            mode: 'client',
                            message: 'Payment failed, please try again.',
                            duration: 1000,
                            size: 'md',
                            isShow: true
                        })
                        setShowModal(false)
                    },
                    onPending: (result) => {
                        console.log("Payment pending:", result);
                        notification.setNotification({
                            type: 'info',
                            mode: 'client',
                            message: 'Payment is pending, please continue to payment page.',
                            duration: 1000,
                            size: 'md',
                            isShow: true
                        })
                        setShowModal(false)
                    },
                    onSuccess: (result) => {
                        console.log("Payment success:", result)
                        notification.setNotification({
                            type: 'success',
                            mode: 'client',
                            message: 'Top up successful!',
                            duration: 1000,
                            size: 'md',
                            isShow: true
                        })
                        setShowModal(false);
                        setTimeout(
                            () => {
                                window.location.reload();
                            },
                            1000
                        )
                    }
                }
            )
        }
    }

    return (
        <section className="container mx-auto my-10">
            <Modal size={'md'} title={'Top Up Wallet'} show={showModal} handleClose={() => setShowModal(false)}>
                <div className="p-10">
                    <form onSubmit={handleSubmitTopUp}>
                        <Input type={'text'}
                               name={'amount'}
                               label={'Top Up Amount'}
                               placeholder={'Enter amount to top up'}
                               required={true}
                               onChange={handleChange}
                               value={amount.amountFormatted}
                        />
                        <div className="mt-10">
                            <button type="submit"
                                    className="w-full btn-primary text-white py-3 px-7 rounded-lg cursor-pointer">
                                Top Up
                            </button>
                        </div>
                    </form>
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

            {
                loading ? <WalletSkeleton/> :
                    data.is_active ?
                        <WalletActive balance={data.balance} handleShowModalTopUp={() => setShowModal(true)}/>
                        :
                        <WalletNotActive/>
            }
        </section>
    );
}

export default WalletPage;
