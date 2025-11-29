import ImgBgWalletNotActive from "../assets/images/ImgBgWalletNotActive.png";
import {Link} from "react-router";

const WalletNotActive = () => {
    return (
        <div className={'mt-10 bg-white dark:bg-gray-800 p-8 rounded-2xl '}>
            <img className={'mx-auto'} src={ImgBgWalletNotActive}
                 alt={'Image background wallet not active'}/>
            <div className={'flex flex-col items-center'}>
                <h3 className={'text-3xl font-bold text-gray-700 dark:text-gray-100 mb-4'}>
                    Upps..
                </h3>
                <p className={'text-gray-500 dark:text-gray-300 text-xl text-center mb-6'}>
                    Your balance is not active yet
                </p>
                <Link to={'/my-wallet/activate'}
                      className={'btn-primary mt-4 mb-10 text-white dark:text-white px-6 py-2 rounded-md'}>
                    Activate
                </Link>
            </div>
        </div>
    )
}

export default WalletNotActive;