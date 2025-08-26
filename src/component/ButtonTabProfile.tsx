import {Link} from "react-router";

interface ButtonTabProfileProps {
    to?: string;
    icon: React.ReactNode;
    title: string;
    onClick?: () => void;
}

const ButtonTabProfile: React.FC<ButtonTabProfileProps> = ({title, onClick, icon, to}) => {
    if (to) {
        return (
            <div className={'my-3'}>
                <Link
                    className={'px-5 flex gap-3 items-center cursor-pointer text-xs sm:text-base hover:text-black text-gray-600 duration-300 transition-all font-semibold'}
                    to={to}>
                    <span className={' text-sm sm:text-xl'}>

                    {
                        icon
                    }
                    </span>
                    {
                        title
                    }
                </Link>
            </div>

        )
    } else {
        return (
            <div className={'my-3'}>
                <button
                    onClick={onClick}
                    className={'px-5 flex gap-3 items-center cursor-pointer text-xs sm:text-base hover:text-black text-gray-600 duration-300 transition-all font-semibold'}>
                    <span className={' text-sm sm:text-xl'}>

                    {
                        icon
                    }
                    </span>
                    {title}
                </button>
            </div>
        )
    }
}

export default ButtonTabProfile;