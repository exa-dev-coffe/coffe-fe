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
        <div className={'flex sm:flex-row flex-col sm:items-start items-center gap-4 text-gray-900 dark:text-gray-100'}>
            <div className={'self-start'}>
                <CheckBox name={'checked-' + id} value={checked} onChange={handleChangeCheckBox}/>
            </div>
            <div className={'space-y-6'}>
                <div className={'flex flex-col  sm:flex-row items-center     sm:items-start gap-4'}>


                    <img className={'md:w-48 w-32 md:h-48 h-32 object-cover rounded-xl'} src={photo}
                         alt={nameProduct}/>
                    <div className={'space-y-3 text-lg sm:text-3xl'}>
                        <h4 className={'text-gray-900 dark:text-gray-100'}>
                            {nameProduct}
                        </h4>
                        <h6 className={'sm:text-xl text-sm text-gray-700 dark:text-gray-300'}>
                            {formatCurrency(totalPrice)}
                        </h6>
                        <div className={'flex  items-center gap-2 text-lg sm:text-3xl mt-10'}>
                            <button
                                onClick={() => handleChangeAmount({increment: false, id})}
                                disabled={amount <= 1}
                                className={'disabled:cursor-not-allowed cursor-pointer'}
                            >
                                <CiCircleMinus className="text-gray-700 dark:text-gray-300"/>
                            </button>
                            <span className={'text-gray-600 dark:text-gray-300'}>
                                                        {amount}
                                                    </span>
                            <button
                                onClick={() => handleChangeAmount({increment: true, id})}
                                className={'cursor-pointer'}
                            >

                                <CiCirclePlus className="text-gray-700 dark:text-gray-300"/>
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