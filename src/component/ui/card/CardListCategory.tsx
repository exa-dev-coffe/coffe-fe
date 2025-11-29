import {BiSolidTrash} from "react-icons/bi";
import {Link} from "react-router";
import {CiViewList} from "react-icons/ci";

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
        <div className={'py-4 border-y border-gray-300 dark:border-slate-700 grid grid-cols-2 items-start gap-4'}>
            <div className={'flex gap-4'}>
                <div>
                    <h4 className={'text-slate-800 dark:text-slate-100'}>{name}</h4>
                </div>
            </div>
            <div>
                <div className={'flex items-center mb-2 justify-end gap-2'}>
                    <h4 className={'text-center w-20 text-slate-600 dark:text-slate-300'}>
                        Action
                    </h4>
                </div>
                <div className={'flex items-center justify-end gap-2'}>
                    <Link to={`${id}`}>
                        <CiViewList className={'text-3xl text-slate-600 dark:text-slate-300'}/>
                    </Link>
                    <BiSolidTrash
                        onClick={() => {
                            showModalDelete(id);
                        }}
                        className={'text-red-500 dark:text-red-400 text-3xl cursor-pointer'}/>
                </div>
            </div>
        </div>
    )
}

export default CardListCategory;