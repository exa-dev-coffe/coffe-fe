import CheckBox from "../form/CheckBox.tsx";
import {formatCurrency} from "../../../utils";
import {CiCircleMinus, CiCirclePlus} from "react-icons/ci";
import TextArea from "../form/TextArea.tsx";

interface CardCartProps {
    handleChangeNotes: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleChangeCheckBox: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeAmount: (data: { increment: boolean; id: number }) => void;
    checked: boolean;
    photo: string;
    nameProduct: string;
    price: number;
    amount: number;
    id: number;
    notes: string;
}

const CardCart: React.FC<CardCartProps> = ({
                                               notes,
                                               amount,
                                               price,
                                               photo,
                                               id,
                                               checked,
                                               nameProduct,
                                               handleChangeNotes,
                                               handleChangeAmount,
                                               handleChangeCheckBox
                                           }) => {

    const totalPrice = amount * price;

    return (
        <div className={'flex items-start gap-4'}>
            <CheckBox name={'checked-' + id} value={checked} onChange={handleChangeCheckBox}/>
            <div className={'space-y-6'}>
                <div className={'flex items-start gap-4'}>


                    <img className={'w-48 h-48 object-cover rounded-xl'} src={photo}
                         alt={nameProduct}/>
                    <div className={'space-y-3 text-3xl'}>
                        <h4 className={''}>
                            {nameProduct}
                        </h4>
                        <h6 className={'text-xl'}>
                            {formatCurrency(totalPrice)}
                        </h6>
                        <div className={'flex  items-center gap-2 text-3xl mt-10'}>
                            <button
                                onClick={() => handleChangeAmount({increment: false, id})}
                                disabled={amount <= 1}
                                className={'disabled:cursor-not-allowed cursor-pointer'}
                            >
                                <CiCircleMinus/>
                            </button>
                            <span className={'text-gray-600'}>
                                                        {amount}
                                                    </span>
                            <button
                                onClick={() => handleChangeAmount({increment: true, id})}
                                className={'cursor-pointer'}
                            >

                                <CiCirclePlus
                                />
                            </button>
                        </div>
                    </div>
                </div>
                <TextArea label={'Notes'} name={'notes-' + id} value={notes} placeholder={'Add notes here...'}
                          onChange={handleChangeNotes}/>
            </div>
        </div>
    )
}

export default CardCart;