import {formatCurrency, formatDateTime} from "../../../utils";
import ImgIconWallet from '../../../assets/images/iconWallet.png';

interface CardHistoryWalletProps {
    status: string // pending, cancelled, failed, completed
    createdAt: string
    amount: number
    handleContinuePayment: (token: string) => void
    token?: string
    type: string
}

const CardHistoryWallet: React.FC<CardHistoryWalletProps> = ({
                                                                 status,
                                                                 token,
                                                                 handleContinuePayment,
                                                                 amount,
                                                                 type,
                                                                 createdAt,
                                                             }) => {
    const statusBgClass = status === 'pending'
        ? 'bg-[#F9F5BD] dark:bg-yellow-900'
        : ["cancelled", "failed"].includes(status)
            ? 'bg-[#FFCDD2] dark:bg-red-900'
            : 'bg-[#CBF9BD] dark:bg-green-900';

    const statusTextClass = status === 'pending'
        ? 'text-[#F9A825] dark:text-yellow-300'
        : ["cancelled", "failed"].includes(status)
            ? 'text-[#F44336] dark:text-red-300'
            : 'text-[#47DC53] dark:text-green-300';

    return (
        <div data-aos={'fade-up'}
             className={'py-4 border-y border-gray-300 dark:border-gray-700 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <div
                    className={`sm:p-6 p-3 sm:block hidden rounded-md ${statusBgClass}`}>
                    <img className={'w-20 h-20'} src={ImgIconWallet} alt={`icon wallet`}/>
                </div>
                <div>
                    <h5
                        className={`sm:text-base text-xs capitalize font-semibold ${statusTextClass}`}>
                        {status}
                    </h5>
                    <h4 className={'text-sm sm:text-2xl capitalize text-gray-900 dark:text-gray-100'}>{type}</h4>
                    {
                        token && status === 'pending' &&
                        <button onClick={() => handleContinuePayment(token)}
                                className={'btn-primary px-4 py-2 rounded-md text-white mt-4 dark:opacity-95'}>
                            Continue Payment
                        </button>
                    }
                </div>
            </div>
            <div className={'flex items-center justify-end gap-4'}>
                <div className={'flex items-end flex-col justify-end gap-4'}>
                    <p className={'text-sm sm:text-xl text-gray-500 dark:text-gray-300'}>{formatDateTime(createdAt)}</p>
                    <h4 className={'text-sm sm:text-2xl text-gray-900 dark:text-gray-100'}>
                        {formatCurrency(amount)}
                    </h4>
                </div>
            </div>
        </div>
    )
}

export default CardHistoryWallet;