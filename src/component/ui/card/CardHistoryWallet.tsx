import {formatCurrency, formatDateTime} from "../../../utils";
import ImgIconWallet from '../../../assets/images/iconWallet.png';

interface CardHistoryWalletProps {
    status: string // pending, cancelled, failed, completed
    created_at: string
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
                                                                 created_at,
                                                             }) => {
    return (
        <div data-aos={'fade-up'} className={'py-4 border-y border-gray-300 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <div
                    className={`sm:p-6 p-3 sm:block hidden rounded-md ${status === 'pending' ? 'bg-[#F9F5BD]' : ["cancelled", "failed"].includes(status) ? 'bg-[#FFCDD2]' : 'bg-[#CBF9BD]'}`}>
                    <img className={'w-20  h-20 '} src={ImgIconWallet} alt={`icon wallet`}/>
                </div>
                <div className=''>
                    <h5 className={`sm:text-base text-xs capitalize font-semibold  ${status === 'pending' ? `text-[#F9A825]` : ["cancelled", "failed"].includes(status) ? `text-[#F44336]` : `text-[#47DC53]`}`}>{
                        status
                    }</h5>
                    <h4 className={' text-sm sm:text-2xl capitalize'}>{type}</h4>
                    {
                        token && status === 'pending' &&
                        <button onClick={() => handleContinuePayment(token)}
                                className={'btn-primary px-4 py-2 rounded-md text-white mt-4'}>
                            Continue Payment
                        </button>
                    }
                </div>
            </div>
            <div className={'flex items-center justify-end gap-4'}>
                <div
                    className={'flex items-end flex-col justify-end gap-4'}>
                    <p className={'text-sm sm:text-xl text-gray-500'}>{formatDateTime(created_at)}</p>
                    <h4 className={'text-sm sm:text-2xl '}>
                        {formatCurrency(amount)}
                    </h4>
                </div>
            </div>

        </div>
    )
}

export default CardHistoryWallet;