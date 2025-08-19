import {formatCurrency, formatDateTime} from "../../../utils";
import ImgIconWallet from '../../../assets/images/iconWallet.png';

interface CardHistoryWalletProps {
    status: number // 2: Success, 1: Pending, 3: Failed
    label_status: string
    label: string
    created_at: string
    amount: number
    handleContinuePayment: (token: string) => void
    token?: string
}

const CardHistoryWallet: React.FC<CardHistoryWalletProps> = ({
                                                                 status,
                                                                 token,
                                                                 handleContinuePayment,
                                                                 label,
                                                                 amount,
                                                                 created_at,
                                                                 label_status
                                                             }) => {
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <div
                    className={`p-6 rounded-md ${status === 1 ? 'bg-[#F9F5BD]' : status === 3 ? 'bg-[#FFCDD2]' : 'bg-[#CBF9BD]'}`}>
                    <img className={'w-12 h-12'} src={ImgIconWallet} alt={`icon wallet`}/>
                </div>
                <div className=''>
                    <h5 className={`text-base font-semibold  ${status === 1 ? `text-[#F9A825]` : status === 3 ? `text-[#F44336]` : status === 2 ? `text-[#47DC53]` : ``}`}>{
                        label_status
                    }</h5>
                    <h4 className={' text-2xl'}>{label}</h4>
                </div>
            </div>
            <div className={'flex items-center justify-end gap-4'}>
                <div
                    className={'flex items-end flex-col justify-end gap-4'}>
                    <p className={'text-gray-500'}>{formatDateTime(created_at)}</p>
                    <h4 className={'text-2xl '}>
                        {formatCurrency(amount)}
                    </h4>
                </div>
                {
                    token &&
                    <button onClick={() => handleContinuePayment(token)}
                            className={'btn-primary px-4 py-2 rounded-md text-white'}>
                        Continue Payment
                    </button>
                }
            </div>

        </div>
    )
}

export default CardHistoryWallet;