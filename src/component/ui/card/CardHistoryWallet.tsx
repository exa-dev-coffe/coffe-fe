import {formatDateTime} from "../../../utils";
import ImgIconWallet from '../../../assets/images/iconWallet.png';

const CardHistoryWallet = () => {
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <div className='p-6 rounded-md bg-[#CBF9BD]'>
                    <img className={'w-12 h-12'} src={ImgIconWallet} alt={`icon wallet`}/>
                </div>
                <div className=''>
                    <h5 className={'text-base font-semibold text-[#47DC53]'}>Success</h5>
                    <h4 className={' text-2xl'}>Top up Balance</h4>
                </div>
            </div>
            <div
                className={'flex items-end flex-col justify-end gap-4'}>
                <p className={'text-gray-500'}>{formatDateTime(new Date().toISOString())}</p>
                <h4 className={'text-2xl '}>
                    Rp. 100.000
                </h4>
            </div>

        </div>
    )
}

export default CardHistoryWallet;