import {Link} from "react-router";
import {IoIosInformationCircleOutline} from "react-icons/io";

interface CardDasboardMenuProps {
    title: string;
    to: string;
    count: number;
}

const CardDasboardMenu: React.FC<CardDasboardMenuProps> = ({title, count, to}) => {
    return (
        <Link to={to}
              className={'bg-white hover:bg-gray-200 duration-300 transition-all h-44 w-72 flex flex-col justify-between'}>
            <div className={'flex text-2xl p-4 justify-between items-center'}>
                <h5 className={'font-light'}>
                    {title}
                </h5>
                <IoIosInformationCircleOutline/>
            </div>
            <h4 className={'text-3xl p-4 mb-3 '}>
                {count}
            </h4>
        </Link>
    )
}

export default CardDasboardMenu;