import ImgBgTopWallet from "../assets/images/bgTopWallet.png";
import Logo from "../assets/images/icon.png";
import {formatCurrency, formatNumberCurrency} from "../utils";
import ImgBgWalletNotActive from "../assets/images/ImgBgWalletNotActive.png";
import CardHistoryWallet from "./ui/card/CardHistoryWallet.tsx";
import Input from "./ui/form/Input.tsx";
import Modal from "./ui/Modal.tsx";
import {type FormEvent, useCallback, useEffect, useRef, useState} from "react";
import useNotificationContext from "../hook/useNotificationContext.ts";
import type {PayloadUpdateBalanceSSE, ResponseTopUp} from "../model/wallet.ts";
import useWallet from "../hook/useWallet.ts";
import CardHistoryWalletSkeleton from "./ui/Skeleton/CardHistoryWalletSkeleton.tsx";
import useSSE from "../hook/useSSE.ts";
import Config from "../config/config.ts";

interface WalletActiveProps {
    balance: number;
    handleTopUp: (amount: number) => Promise<ResponseTopUp | null | undefined>;
}

const WalletActive: React.FC<WalletActiveProps> = ({balance, handleTopUp}) => {
    const notification = useNotificationContext()
    const refLoader = useRef<HTMLDivElement>(null);
    const {
        getHistoryBalance,
        loading,
        data,
        page,
        setData: setDataHistoryBalance,
        handlePaginate,
        totalData
    } = useWallet()
    const [loadingFirst, setLoadingFirst] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [amount, setAmount] = useState({
        amount: 0,
        amountFormatted: 'Rp 0',
    });
    const isMaxScroll = page * 10 >= totalData;
    useSSE<PayloadUpdateBalanceSSE>({
        baseUrl: `${Config.BASE_URL}/api/1.0/events?type=update_history_balance`,
        autoConnect: true,
        onMessage: useCallback((dataSSE) => {
            setDataHistoryBalance(prev => {
                return prev.map(item =>
                    item.id === dataSSE.balanceHistoryId
                        ? {...item, status: dataSSE.status.toLowerCase()}
                        : item
                );
            });
        }, [])
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                await getHistoryBalance();
            } finally {
                setLoadingFirst(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const target = refLoader.current;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !isMaxScroll) {
                    handlePaginate(page + 1);
                }
            }, {
                threshold: 1
            }
        )

        if (target && !loading && !isMaxScroll) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        }

    }, [page, loading]);

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
                        handlePaginate(1)
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
                        handlePaginate(1)
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
                        handlePaginate(1)
                        setShowModal(false);
                        setTimeout(
                            () => {
                                window.location.reload();
                            },
                            1000
                        )
                    },
                    onClose: () => {
                        console.log("Payment closed");
                        notification.setNotification({
                            type: 'info',
                            mode: 'client',
                            message: 'Payment closed, please try again.',
                            duration: 1000,
                            size: 'md',
                            isShow: true
                        })
                        setShowModal(false)
                        handlePaginate(1)
                    }
                }
            )
        }
    }

    const handleContinuePayment = async (token: string) => {
        window.snap.pay(
            token,
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
                    handlePaginate(1)
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
                    handlePaginate(1)
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

    return (
        <>
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
            <div className={'mt-10 bg-white p-8 rounded-2xl flex justify-between items-center'}>
                <h4 className={'font-bold text-5xl'}>
                    Wallet
                </h4>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl grid lg:grid-cols-2'}>
                <div className={'w-full mt-10'}>
                    <div className={'flex justify-between gap-5 sm:flex-row flex-col items-center w-full'}>
                        <h4 className={'font-bold text-2xl'}>
                            Your Balance
                        </h4>
                        <button onClick={() => setShowModal(true)}
                                className={'btn-primary px-8 py-2 rounded-md text-white'}>
                            Top Up
                        </button>
                    </div>
                    <div className={'w-full h-44 rounded-2xl rounded-b-none sm:h-48 bg-no-repeat bg-cover mt-20'}
                         style={
                             {
                                 backgroundImage: `url(${ImgBgTopWallet})`,
                             }
                         }>
                        <img className={'h-20 ms-7 pt-6'} src={Logo} alt={'Logo'}/>
                        <h5 className={'text-end text-2xl sm:text-5xl me-8 pt-4 font-thin text-white'}>Wallet</h5>
                    </div>
                    <div
                        className={'h-44 rounded-2xl rounded-t-none sm:h-48 w-full rounded-b-md py-8 px-7 space-y-6    bg-[#263238]'}>
                        <h4 className={'text-2xl sm:text-5xl text-white'}>
                            Rp.
                        </h4>
                        <h6 className={'text-2xl sm:text-5xl text-white'}>
                            {formatNumberCurrency(balance)}
                        </h6>
                    </div>
                </div>
                <img className={'m-auto lg:block hidden'} src={ImgBgWalletNotActive}
                     alt={'Image background wallet not active'}/>
            </div>
            <div className={'mt-10 bg-white p-8 rounded-2xl'}>
                <h4 className={'font-bold mb-10 text-5xl'}>
                    History
                </h4>
                <div className={'mt-6 w-full'}>
                    {
                        loadingFirst ? Array.from({length: 10}, (_, index) => (
                                <CardHistoryWalletSkeleton key={index}/>
                            ))
                            :
                            totalData === 0 ? (
                                <p className="text-gray-500 py-32 text-center">No history available.</p>
                            ) : (
                                data.map((item, index) => (
                                    <CardHistoryWallet handleContinuePayment={handleContinuePayment} {...item}
                                                       key={index}/>
                                ))
                            )
                    }
                    {
                        !isMaxScroll &&
                        <div ref={refLoader} className={'flex mt-10 flex-col justify-center items-center w-full'}
                        >
                            <div className="spinner mx-auto mb-4">
                            </div>
                            <p>Load More ...</p>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}

export default WalletActive