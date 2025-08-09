import {BiSolidTrash} from "react-icons/bi";
import {HiPencilAlt} from "react-icons/hi";

interface CardTableProps {
    id: number;
    name: string;
    showModalDelete: (id: number) => void;
    showTabUpdate: (id: number) => void;
    updated_at: string;
}

const CardTable: React.FC<CardTableProps> = ({
                                                 id,
                                                 showModalDelete,
                                                 showTabUpdate,
                                                 updated_at,
                                                 name,
                                             }) => {
    return (
        <div className={'py-4 border-y border-gray-300 grid grid-cols-3 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <h4>
                    {name}
                </h4>
            </div>
            <div>
                <h4>Last Update</h4>
                <p className={'text-sm text-gray-500'}>{updated_at}</p>
            </div>
            <div>
                <h4 className={'text-center'}>
                    Action
                </h4>
                <div className={'flex items-center justify-center gap-2'}>
                    <HiPencilAlt onClick={
                        () => {
                            showTabUpdate(id);
                        }
                    } className={'color-primary text-3xl'}/>
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

export default CardTable;