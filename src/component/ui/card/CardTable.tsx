// src/component/ui/card/CardTable.tsx
import {BiSolidTrash} from "react-icons/bi";
import {HiPencilAlt} from "react-icons/hi";
import {formatDateTime} from "../../../utils";

interface CardTableProps {
    id: number;
    name: string;
    showModalDelete: (id: number) => void;
    showTabUpdate: (id: number) => void;
    updatedAt: string;
}

const CardTable: React.FC<CardTableProps> = ({
                                                 id,
                                                 showModalDelete,
                                                 showTabUpdate,
                                                 updatedAt,
                                                 name,
                                             }) => {
    return (
        <div className={
            'py-4 border-y min-w-2xl border-gray-300 dark:border-slate-700 grid grid-cols-3 items-start gap-4 bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100'
        }>
            <div className={'flex items-center gap-4'}>
                <h4 className={'text-slate-800 dark:text-slate-100'}>
                    {name}
                </h4>
            </div>
            <div>
                <h4 className={'text-slate-800 dark:text-slate-100'}>Last Update</h4>
                <p className={'text-sm text-gray-500 dark:text-slate-400'}>{formatDateTime(updatedAt)}</p>
            </div>
            <div>
                <h4 className={'text-center text-slate-800 dark:text-slate-100'}>
                    Action
                </h4>
                <div className={'flex items-center justify-center gap-2'}>
                    <HiPencilAlt
                        onClick={() => showTabUpdate(id)}
                        className={'color-primary text-3xl cursor-pointer hover:opacity-90'}
                    />
                    <BiSolidTrash
                        onClick={() => showModalDelete(id)}
                        className={'text-red-500 dark:text-red-400 text-3xl cursor-pointer hover:opacity-90'}
                    />
                </div>
            </div>
        </div>
    )
}

export default CardTable;