import {BiSolidTrash} from "react-icons/bi";
import DummyPhoto from '../../../assets/images/dummyProfile.png';

interface CardBaristaProps {
    id: number;
    photo: string;
    full_name: string;
    email: string;
    showModalDelete: (id: number) => void;
}

const CardBarista: React.FC<CardBaristaProps> = ({
                                                     id,
                                                     full_name,
                                                     photo,
                                                     showModalDelete,
                                                     email
                                                 }) => {
    return (
        <div
            className={'py-4 border-y min-w-2xl border-gray-300 dark:border-slate-700 grid grid-cols-3 items-start gap-4 bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100'}>
            <div className={'flex items-center gap-4'}>
                <img
                    className={'w-12 h-12 rounded-sm bg-gray-100 dark:bg-slate-700 object-cover'}
                    src={photo || DummyPhoto}
                    alt={full_name || 'Barista'}
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DummyPhoto;
                    }}
                />
                <h4 className={'text-slate-800 dark:text-slate-100'}>
                    {full_name || 'Barista'}
                </h4>
            </div>
            <div>
                <h4 className={'text-slate-800 dark:text-slate-100'}>Email</h4>
                <p className={'text-sm max-w-40 truncate text-gray-500 dark:text-slate-400'}>{email}</p>
            </div>
            <div>
                <h4 className={'text-center text-slate-800 dark:text-slate-100'}>
                    Action
                </h4>
                <div className={'flex items-center justify-center gap-2'}>
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

export default CardBarista;