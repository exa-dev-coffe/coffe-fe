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
        >
            <div
                className={'relative w-full hover:-translate-y-2 duration-300 transition-all hover:bg-gray-100 pb-3 rounded-2xl flex flex-col h-60'}>
                <img src={photo || DummyProduct} alt={name}
                     className={'w-full h-44 object-cover rounded-2xl'}/>
                <div className={'absolute top-2 right-1 '}>
                    <button
                        className={'bg-white p-1 text-black font-bold  rounded-lg '}>
                        <FaRegThumbsUp/>
                        <span className={'text-xs'}>{rating}</span>
                    </button>
                </div>
                <div className={'grow m-4'}>
                    <h4 className={'text-center mt-2 h-10 truncate '}>
                        <span className={'font-bold text-lg'}>{name}</span>
                    </h4>
                </div>
            </div>
        </Link>
    )
}

export default CardMenu;