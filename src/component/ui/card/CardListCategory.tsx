import {HiPencilAlt} from "react-icons/hi";
import {BiSolidTrash} from "react-icons/bi";
import {Link} from "react-router";

interface CardListCategoryProps {
    id: number;
    name: string;
    showModalDelete: (id: number) => void;
}

const CardListCategory: React.FC<CardListCategoryProps> = ({
                                                               id,
                                                               name,
                                                               showModalDelete,
                                                           }) => {
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex gap-4'}>
                <div>
                    <h4>{name}</h4>
                </div>
            </div>
            <div>
                <div className={'flex items-center mb-2 justify-end gap-2'}>

                    <h4 className={'text-center w-20'}>
                        Action
                    </h4>
                </div>
                <div className={'flex items-center justify-end gap-2'}>
                    <Link to={`${id}`}>
                        <HiPencilAlt className={'color-primary text-3xl'}/>
                    </Link>
                    <BiSolidTrash
                        onClick={() => {
                            showModalDelete(id);
                        }}
                        className={'text-red-500 text-3xl cursor-pointer'}/>
                </div>
            </div>
        </div>
    )
}

export default CardListCategory;