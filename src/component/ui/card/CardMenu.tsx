import {Link} from "react-router";
import DummyProduct from "../../../assets/images/dummyProduct.png";
import {FaRegThumbsUp} from "react-icons/fa";

interface CardMenuProps {
    id: number;
    photo: string;
    name: string;
    rating: number;
}

const CardMenu: React.FC<CardMenuProps> = ({rating, photo, name, id}) => {
    return (
        <Link to={'/menu/' + id}
              data-aos="fade-up"
              className={'sm:w-44 w-28 h-48 sm:h-60 mx-auto'}
        >
            <div
                className={
                    'relative sm:w-44 w-28 mx-auto hover:-translate-y-2 duration-300 transition-all ' +
                    'pb-3 rounded-2xl flex flex-col sm:h-60 h-48 ' +
                    'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
            >
                <img
                    src={photo || DummyProduct}
                    alt={name}
                    className={
                        'sm:w-44 w-28 sm:h-44 h-28 object-cover rounded-2xl ' +
                        'bg-gray-100 dark:bg-gray-700'
                    }
                />
                <div className={'absolute top-2 right-1'}>
                    <button
                        className={
                            'flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-1 text-black dark:text-white font-bold rounded-lg shadow-sm'
                        }
                    >
                        <FaRegThumbsUp/>
                        <span className={'text-xs text-gray-800 dark:text-gray-200'}>{rating}</span>
                    </button>
                </div>
                <div className={'grow m-4'}>
                    <h4 className={'text-center mt-2 h-10 truncate'}>
                        <span className={'font-bold text-lg text-gray-900 dark:text-gray-100'}>{name}</span>
                    </h4>
                </div>
            </div>
        </Link>
    );
}

export default CardMenu;