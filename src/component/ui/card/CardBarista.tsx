import {BiSolidTrash} from "react-icons/bi";

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
        <div className={'py-4 border-y border-gray-300 grid grid-cols-3 items-start gap-4'}>
            <div className={'flex items-center gap-4'}>
                <img className={'w-12 h-12'} src={`${photo}`} alt={`${full_name}`}/>
                <h4>
                    {full_name || 'Barista'}
                </h4>
            </div>
            <div>
                <h4>Email</h4>
                <p className={'text-sm max-w-40 truncate text-gray-500'}>{email}</p>
            </div>
            <div>
                <h4 className={'text-center'}>
                    Action
                </h4>
                <div className={'flex items-center justify-center gap-2'}>
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

export default CardBarista;